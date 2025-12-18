import { Show, onMount, createSignal, createEffect, onCleanup, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './IntroductionToAiAssistant.module.css';
import feedbackStyles from '../1-3/AiFeedbackReview.module.css';
import { finishingUpqScripts } from '../../data/scripts/4-2';
import { aiFeedbackReviewScripts } from '../../data/scripts/1-3';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';
import { ConfirmButton } from '../1-3/ConfirmButton';
import { ScoreBoard } from '../1-3/ScoreBoard';
import { callGPT4Mini, type PromptScores } from '../../utils/gptChat';
import { getAllCardSelections, resetAiCompareCheck } from '../../utils/aiCompareCheck';

const FinishingUpq = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [characterImageUrl, setCharacterImageUrl] = createSignal(getS3ImageURL('4-2/pocketMai.png'));
  const [backgroundImageUrl] = createSignal(getS3ImageURL('4-2/maiCity.png'));
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false);
  const [isFading, setIsFading] = createSignal(false);
  const [isFadeOut, setIsFadeOut] = createSignal(false);
  const [displayCharacterUrl, setDisplayCharacterUrl] = createSignal(getS3ImageURL('4-2/pocketMai.png'));
  const [showScoreBoard, setShowScoreBoard] = createSignal(false);
  const [feedbackScriptIndex, setFeedbackScriptIndex] = createSignal(-1);
  const [showConfirmButton, setShowConfirmButton] = createSignal(false);
  const [scores, setScores] = createSignal<PromptScores | null>(null);
  const [isEvaluating, setIsEvaluating] = createSignal(false);
  const [showFeedbackScreen, setShowFeedbackScreen] = createSignal(false);
  const [feedbackAudioContextActivated, setFeedbackAudioContextActivated] = createSignal(false);
  const [feedbackWasSkipped, setFeedbackWasSkipped] = createSignal(false);
  const [currentPlayingScriptIndex, setCurrentPlayingScriptIndex] = createSignal<number | null>(null);
  const [currentPlayingFeedbackScriptIndex, setCurrentPlayingFeedbackScriptIndex] = createSignal<number | null>(null);
  const feedbackTypingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const feedbackAudioPlayback = useAudioPlayback();
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  let feedbackAutoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  const navigate = useNavigate();
  const params = useParams();
  
  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  
  // 오디오 재생 훅
  const audioPlayback = useAudioPlayback();

  // 현재 스크립트 가져오기
  const currentScript = () => finishingUpqScripts[currentScriptIndex()];
  
  // 자동 진행 타이머 취소
  const cancelAutoProceed = () => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  };

  // 4-2용 프롬프트 평가 함수
  const evaluateCompareAiAssistantPrompts = async (): Promise<PromptScores> => {
    // 로컬스토리지에서 데이터 가져오기
    const selections = getAllCardSelections();

    // 모든 응답을 하나로 합치기 (reason만 추출)
    const reasons = [1, 2, 3]
      .map(cardId => selections[cardId]?.reason || '')
      .filter(r => r && r.trim().length > 0);
    
    const combinedResponses = reasons.join('\n\n');

    if (!combinedResponses) {
      // 데이터가 없으면 기본 피드백 반환
      return {
        specificity: 2,
        clarity: 2,
        contextuality: 2,
        feedback: {
          specificity: 'AI 비서 비교 평가를 더 완성도 있게 작성해보세요!',
          clarity: '비서 선택이 상황에 더 적합한지 설명해보세요!',
          contextuality: '선택한 비서의 타당성을 더 명확히 표현해보세요!'
        }
      };
    }

    const evaluationPrompt = `다음은 사용자가 세 가지 AI 비서(스마티, 카일리, 로고스)의 답변을 비교한 후 작성한 평가입니다:

"${combinedResponses}"

이 평가를 다음 세 가지 기준으로 평가해주세요:
- 완성도 (specificity): 평가가 얼마나 완성도 있게 작성되었는가? (2점: 보통, 3점: 매우 완성도 높음) - 최소 2점부터 시작
- 적합성 (clarity): 선택한 비서가 상황에 얼마나 적합한지 설명되었는가? (2점: 보통, 3점: 매우 적합) - 최소 2점부터 시작
- 타당성 (contextuality): 선택한 비서의 타당성이 얼마나 명확하게 설명되었는가? (2점: 보통, 3점: 매우 타당) - 최소 2점부터 시작

참고: 점수는 2점 또는 3점만 부여해주세요. 1점은 거의 주지 않도록 해주세요.

각 항목에 대해 점수와 함께 친근하고 격려하는 톤의 피드백을 작성해주세요.
**중요: 각 피드백은 반드시 4줄 이하로 간결하게 작성해주세요.**

응답 형식은 반드시 다음 JSON 형식으로만 답변해주세요:
{
  "specificity": 1-3,
  "clarity": 1-3,
  "contextuality": 1-3,
  "feedback": {
    "specificity": "완성도에 대한 피드백 (친근하고 격려하는 톤)",
    "clarity": "적합성에 대한 피드백 (친근하고 격려하는 톤)",
    "contextuality": "타당성에 대한 피드백 (친근하고 격려하는 톤)"
  }
}`;

    try {
      const messages = [
        {
          role: 'system' as const,
          content: '당신은 AI 비서 평가 전문가입니다. 주어진 평가를 객관적이고 정확하게 분석합니다. 반드시 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user' as const,
          content: evaluationPrompt,
        },
      ];

      const response = await callGPT4Mini(messages);
      
      // JSON 파싱 시도
      let parsedResponse: PromptScores;
      
      try {
        // JSON 코드 블록 제거
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = JSON.parse(response);
        }
      } catch (parseError) {
        // 기본값 반환
        return {
          specificity: 2,
          clarity: 2,
          contextuality: 2,
          feedback: {
            specificity: 'AI 비서 비교 평가를 더 완성도 있게 작성해보세요!',
            clarity: '비서 선택이 상황에 더 적합한지 설명해보세요!',
            contextuality: '선택한 비서의 타당성을 더 명확히 표현해보세요!'
          }
        };
      }

      // 점수가 1이면 2로 올리고, 2-3 범위로 조정 (1점은 거의 주지 않음)
      const rawSpecificity = parsedResponse.specificity || 2;
      const rawClarity = parsedResponse.clarity || 2;
      const rawContextuality = parsedResponse.contextuality || 2;
      const specificity = Math.max(2, Math.min(3, rawSpecificity < 2 ? 2 : rawSpecificity));
      const clarity = Math.max(2, Math.min(3, rawClarity < 2 ? 2 : rawClarity));
      const contextuality = Math.max(2, Math.min(3, rawContextuality < 2 ? 2 : rawContextuality));

      return {
        specificity,
        clarity,
        contextuality,
        feedback: parsedResponse.feedback || {
          specificity: 'AI 비서 비교 평가를 더 완성도 있게 작성해보세요!',
          clarity: '비서 선택이 상황에 더 적합한지 설명해보세요!',
          contextuality: '선택한 비서의 타당성을 더 명확히 표현해보세요!'
        }
      };
    } catch (error) {
      // 기본값 반환
      return {
        specificity: 2,
        clarity: 2,
        contextuality: 2,
        feedback: {
          specificity: 'AI 비서 비교 평가를 더 완성도 있게 작성해보세요!',
          clarity: '비서 선택이 상황에 더 적합한지 설명해보세요!',
          contextuality: '선택한 비서의 타당성을 더 명확히 표현해보세요!'
        }
      };
    }
  };

  // 비교 비서 응답 로컬스토리지 초기화
  const clearCompareAiAssistantResponses = () => {
    resetAiCompareCheck();
  };

  // 프롬프트 평가 함수
  const evaluateUserPrompts = async () => {
    setIsEvaluating(true);
    try {
      const evaluatedScores = await evaluateCompareAiAssistantPrompts();
      setScores(evaluatedScores);
    } catch (error) {
      // 기본 점수 및 피드백 설정
      setScores({ 
        specificity: 2, 
        clarity: 2, 
        contextuality: 2,
        feedback: {
          specificity: 'AI 비서 비교 평가를 더 완성도 있게 작성해보세요!',
          clarity: '비서 선택이 상황에 더 적합한지 설명해보세요!',
          contextuality: '선택한 비서의 타당성을 더 명확히 표현해보세요!'
        }
      });
    } finally {
      clearCompareAiAssistantResponses();
      setIsEvaluating(false);
    }
  };

  // 피드백 스크립트 가져오기
  const feedbackCurrentScript = () => {
    const index = feedbackScriptIndex();
    if (index < 0 || index >= aiFeedbackReviewScripts.length) return null;
    return aiFeedbackReviewScripts[index];
  };

  // 피드백 자동 진행 타이머 취소
  const cancelFeedbackAutoProceed = () => {
    if (feedbackAutoProceedTimeout) {
      clearTimeout(feedbackAutoProceedTimeout);
      feedbackAutoProceedTimeout = null;
    }
  };

  // 피드백 다음 스크립트로 진행
  const proceedFeedbackToNext = () => {
    cancelFeedbackAutoProceed();
    const nextIndex = feedbackScriptIndex() + 1;
    
    if (nextIndex < aiFeedbackReviewScripts.length) {
      feedbackTypingAnimation.resetSkipState();
      setFeedbackWasSkipped(false);
      setCurrentPlayingFeedbackScriptIndex(null);
      feedbackAudioPlayback.stopAudio();
      setTimeout(() => {
        setFeedbackScriptIndex(nextIndex);
      }, 10);
    }
  };

  // 피드백 이전 스크립트로 진행
  const proceedFeedbackToPrev = () => {
    cancelFeedbackAutoProceed();
    const prevIndex = feedbackScriptIndex() - 1;
    if (prevIndex >= 0) {
      feedbackTypingAnimation.resetSkipState();
      setFeedbackWasSkipped(false);
      setCurrentPlayingFeedbackScriptIndex(null);
      feedbackAudioPlayback.stopAudio();
      setTimeout(() => {
        setFeedbackScriptIndex(prevIndex);
      }, 10);
    }
  };

  // 피드백 스킵 컨트롤 훅
  useSkipControls({
    isTypingSkipped: feedbackTypingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      const script = feedbackCurrentScript();
      if (script) {
        feedbackTypingAnimation.skipTyping();
        feedbackTypingAnimation.setDisplayedMessage(script.script);
        // feedbackWasSkipped는 설정하지 않음 - 오디오가 재생 중이면 계속 재생되도록
      }
    },
    onSecondSkip: () => {
      cancelFeedbackAutoProceed();
      feedbackAudioPlayback.stopAudio();
      // 자동 진행 제거 - 사용자가 버튼을 눌러야 함
    },
  });

  // 피드백 스크립트 변경 시 처리 (스크립트 인덱스만 추적)
  createEffect(() => {
    if (!showFeedbackScreen()) return;
    
    const scriptIndex = feedbackScriptIndex();
    const script = feedbackCurrentScript();
    if (!script) return;

    // 오디오 재생 로직 - 새로운 스크립트일 때만 재생
    const isNewScript = currentPlayingFeedbackScriptIndex() !== scriptIndex;
    if (isNewScript) {
      setCurrentPlayingFeedbackScriptIndex(scriptIndex);
      feedbackAudioPlayback.playAudio(script.voice, {
        onEnded: () => {
          // 자동 진행 제거 - 사용자가 버튼을 눌러야 함
          if (scriptIndex >= aiFeedbackReviewScripts.length - 1) {
            // 마지막 스크립트 완료 - 버튼 표시
            setShowConfirmButton(true);
          }
        },
      });
    }

    // 오디오 시작과 동시에 타이핑 애니메이션 시작
    feedbackTypingAnimation.startTyping(script.script);
  });

  // 피드백 오디오 컨텍스트 활성화 함수
  const activateFeedbackAudioContext = () => {
    if (feedbackAudioContextActivated()) return;
    
    const emptyAudio = new Audio();
    emptyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    emptyAudio.volume = 0.01;
    emptyAudio.play().then(() => {
      emptyAudio.pause();
      setFeedbackAudioContextActivated(true);
      setTimeout(() => {
        setFeedbackScriptIndex(0);
      }, 100);
    }).catch(() => {
      setFeedbackAudioContextActivated(true);
      setTimeout(() => {
        setFeedbackScriptIndex(0);
      }, 100);
    });
  };

  // 마지막 스크립트 이후 피드백 모달 표시
  const goToNextStep = () => {
    // 피드백 평가 시작
    evaluateUserPrompts();
    // 피드백 화면 표시
    setShowFeedbackScreen(true);
    // 바로 ScoreBoard 표시 (피드백 스크립트 건너뛰기)
    setShowScoreBoard(true);
  };

  // 마지막 스크립트인지 확인
  const isLastScript = () => {
    return currentScriptIndex() >= finishingUpqScripts.length - 1;
  };

  // 다음 스크립트로 진행
  const proceedToNext = () => {
    cancelAutoProceed();
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < finishingUpqScripts.length) {
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      setCurrentPlayingScriptIndex(null);
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
    } else {
      goToNextStep();
    }
  };

  // 이전 스크립트로 진행
  const proceedToPrev = () => {
    cancelAutoProceed();
    const prevIndex = currentScriptIndex() - 1;
    if (prevIndex >= 0) {
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      setCurrentPlayingScriptIndex(null);
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(prevIndex);
      }, 10);
    }
  };

  // 스킵 컨트롤 훅
  useSkipControls({
    isTypingSkipped: typingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      const script = currentScript();
      if (script) {
        typingAnimation.skipTyping();
        typingAnimation.setDisplayedMessage(script.script);
        // wasSkipped는 설정하지 않음 - 오디오가 재생 중이면 계속 재생되도록
      }
    },
    onSecondSkip: () => {
      cancelAutoProceed();
      audioPlayback.stopAudio();
      // 자동 진행 제거 - 사용자가 버튼을 눌러야 함
    },
  });

  // 캐릭터 이미지 변경 시
  createEffect(() => {
    const newCharUrl = characterImageUrl();
    const currentCharUrl = displayCharacterUrl();
    
    if (newCharUrl !== currentCharUrl && !isFading()) {
      setDisplayCharacterUrl(newCharUrl);
    }
  });

  // 스크립트 변경 시 처리 (스크립트 인덱스만 추적)
  createEffect(() => {
    const scriptIndex = currentScriptIndex();
    const script = currentScript();
    if (!script) return;

    // 캐릭터 이미지 업데이트
    if (script.maiPng) {
      setCharacterImageUrl(getS3ImageURL(script.maiPng));
    }

    // 오디오 재생 로직 - 새로운 스크립트일 때만 재생
    const isNewScript = currentPlayingScriptIndex() !== scriptIndex;
    if (isNewScript) {
      setCurrentPlayingScriptIndex(scriptIndex);
      audioPlayback.playAudio(script.voice, {
        onEnded: () => {
          // 자동 진행 제거 - 사용자가 버튼을 눌러야 함
        },
      });
    }

    // 오디오 시작과 동시에 타이핑 애니메이션 시작
    typingAnimation.startTyping(script.script);
  });

  // 오디오 컨텍스트 활성화 함수
  const activateAudioContext = () => {
    if (audioContextActivated()) return;
    
    const emptyAudio = new Audio();
    emptyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    emptyAudio.volume = 0.01;
    emptyAudio.play().then(() => {
      emptyAudio.pause();
      setAudioContextActivated(true);
      setTimeout(() => {
        setCurrentScriptIndex(0);
      }, 100);
    }).catch(() => {
      setAudioContextActivated(true);
      setTimeout(() => {
        setCurrentScriptIndex(0);
      }, 100);
    });
  };

  onMount(async () => {
    // 모든 이미지 프리로드
    const imageUrls = finishingUpqScripts
      .map(script => [
        script.maiPng ? getS3ImageURL(script.maiPng) : null,
      ])
      .flat()
      .filter(Boolean) as string[];
    
    // 피드백 화면 이미지도 프리로드
    const feedbackImageUrls = aiFeedbackReviewScripts
      .map(script => script.maiPng ? getS3ImageURL(script.maiPng) : null)
      .filter(Boolean) as string[];
      
    try {
      await preloadImages([...imageUrls, ...feedbackImageUrls, backgroundImageUrl(), backgroundImageStyle]);
      setIsReady(true);
    } catch (error) {
      setIsReady(true);
    }

    const handleUserInteraction = () => {
      activateAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);
  });

  onCleanup(() => {
    cancelAutoProceed();
    cancelFeedbackAutoProceed();
  });

  const currentScriptData = () => currentScript();

  const feedbackCurrentScriptImage = () => {
    const script = feedbackCurrentScript();
    if (!script || !script.maiPng) return null;
    
    return (
      <img 
        src={getS3ImageURL(script.maiPng)} 
        alt="MAI" 
        style={{ width: '330px' }}
      />
    );
  };

  const backgroundImageStyle = getS3ImageURL('4-2/maiCity.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <Show when={!showFeedbackScreen()}>
        <div
          class={`${pageContainerStyles.container} ${styles.container} ${isFadeOut() ? styles.fadeOut : styles.fadeIn} ${isFading() ? styles.fading : ''}`}
          style={{
            'background-image': `url(${backgroundImageUrl()})`,
            'background-size': 'cover',
            'background-position': 'center',
            'background-repeat': 'no-repeat',
            'background-attachment': 'fixed',
          }}
        >
          <div class={styles.contentWrapper}>
            <Show when={currentScriptData()?.maiPng && !isFading()}>
              <img
                src={displayCharacterUrl()}
                alt="MAI"
                class={`${styles.characterImage} ${styles.fadeIn}`}
              />
            </Show>
            <Show when={!isFading()}>
              <div class={`${styles.speechBubbleWrapper} ${styles.fadeIn}`}>
                <SpeechBubble 
                  message={typingAnimation.displayedMessage()} 
                  size={1000}
                  showNavigation={true}
                  onNext={proceedToNext}
                  onPrev={proceedToPrev}
                  isComplete={() => {
                    const script = currentScript();
                    if (!script) return false;
                    const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
                    const isAudioComplete = !audioPlayback.isPlaying();
                    // 스킵된 경우 오디오 재생 여부와 관계없이 완료로 간주
                    if (typingAnimation.isTypingSkipped() || wasSkipped()) {
                      return isTypingComplete;
                    }
                    return isTypingComplete && isAudioComplete;
                  }}
                  canGoNext={() => {
                    const script = currentScript();
                    if (!script) return false;
                    const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
                    const isAudioComplete = !audioPlayback.isPlaying();
                    // 스킵된 경우 오디오 재생 여부와 관계없이 완료로 간주
                    const isComplete = (typingAnimation.isTypingSkipped() || wasSkipped()) 
                      ? isTypingComplete 
                      : (isTypingComplete && isAudioComplete);
                    return isComplete && currentScriptIndex() < finishingUpqScripts.length - 1;
                  }}
                  canGoPrev={() => currentScriptIndex() > 0}
                />
              </div>
            </Show>
          </div>

          <Show when={isLastScript() && (typingAnimation.displayedMessage().length === currentScript()?.script.length || wasSkipped())}>
            <div class={styles.buttonContainer}>
              <button
                onClick={goToNextStep}
                class={`${styles.button} ${styles.buttonPrimary}`}
              >
                다음으로
              </button>
            </div>
          </Show>
        </div>
      </Show>

      {/* 피드백 모달 */}
      <Show when={showFeedbackScreen()}>
        <div  
          class={pageContainerStyles.container}
          style={{
            position: 'relative',
            display: 'flex',
            'align-items': 'center',
            'flex-direction': 'column-reverse',
            padding: '1rem 2rem 1rem',
            'background-color': 'white',
          }}>
            {/* 배경 이미지 레이어 (투명도 적용) */}
            <div
              class={feedbackStyles.backgroundLayer}
              style={{
                'background-image': backgroundImageStyleURL,
              }}
            />
            <Show when={!showScoreBoard()}>
              {/* 내용물 레이어 */}
              <div class={feedbackStyles.contentLayer}>
                <Show when={feedbackCurrentScript()}>
                  <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center' }}>
                    {feedbackCurrentScriptImage()}
                    <SpeechBubble 
                      message={feedbackTypingAnimation.displayedMessage()}
                      showNavigation={true}
                      onNext={proceedFeedbackToNext}
                      onPrev={proceedFeedbackToPrev}
                      isComplete={() => {
                        const script = feedbackCurrentScript();
                        if (!script) return false;
                        const isTypingComplete = feedbackTypingAnimation.displayedMessage().length === script.script.length || feedbackTypingAnimation.isTypingSkipped();
                        const isAudioComplete = !feedbackAudioPlayback.isPlaying();
                        // 스킵된 경우 오디오 재생 여부와 관계없이 완료로 간주
                        if (feedbackTypingAnimation.isTypingSkipped() || feedbackWasSkipped()) {
                          return isTypingComplete;
                        }
                        return isTypingComplete && isAudioComplete;
                      }}
                      canGoNext={() => {
                        const script = feedbackCurrentScript();
                        if (!script) return false;
                        const isTypingComplete = feedbackTypingAnimation.displayedMessage().length === script.script.length || feedbackTypingAnimation.isTypingSkipped();
                        const isAudioComplete = !feedbackAudioPlayback.isPlaying();
                        // 스킵된 경우 오디오 재생 여부와 관계없이 완료로 간주
                        const isComplete = (feedbackTypingAnimation.isTypingSkipped() || feedbackWasSkipped()) 
                          ? isTypingComplete 
                          : (isTypingComplete && isAudioComplete);
                        return isComplete && feedbackScriptIndex() < aiFeedbackReviewScripts.length - 1;
                      }}
                      canGoPrev={() => feedbackScriptIndex() > 0}
                    />
                  </div>
                </Show>
              </div>
            </Show>
            <Show when={showConfirmButton() && !showScoreBoard()}>
              <div style={{ 
                position: 'absolute',
                bottom: '1%',
                left: '82%',
                transform: 'translateX(-50%)',
              }}>
                <ConfirmButton 
                  onClick={() => {
                    // ScoreBoard 표시
                    setShowScoreBoard(true);
                  }} 
                  text="다음으로"
                />
              </div>
            </Show>
            <Show when={showScoreBoard()}>
              <ScoreBoard 
                scores={scores()}
                labels={{
                  specificity: '완성도',
                  clarity: '적합성',
                  contextuality: '타당성',
                }}
                onWorldMap={() => {
                  navigate('/worldmap');
                }}
                onSummary={() => {
                  // 학습 요약 페이지로 이동
                }}
                onNextLesson={() => {
                  // 다음 학습으로 이동
                }}
              />
            </Show>
          </div>
      </Show>
    </Show>
  );
};

export default FinishingUpq;

