import { Show, onMount, createSignal, createEffect, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import styles from './AiFeedbackReview.module.css';
import { SpeechBubble } from '../SpeechBubble';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { aiFeedbackReviewScripts } from '../../data/scripts/1-3';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';
import { ConfirmButton } from './ConfirmButton';
import { ScoreBoard } from './ScoreBoard';
import { useDescribeImageStore } from '../../store/1/3/describeImageStore';
import { useCharacterImageStore } from '../../store/1/3/characterImageStore';
import { evaluatePrompts, type PromptScores } from '../../utils/gptChat';

// 개발환경용 테스트 프롬프트
const DEV_SUNSET_PROMPT = '강물이 흐르고 그 위에 태양이 지고 있어 양옆으로는 소나무가 있고 바위가 군데군데 있다';
const DEV_CHARACTER_PROMPT = {
  얼굴: '피부는 살짝 그을린 브론즈 색이고, 눈은 가늘고 강한 인상이야. 입꼬리를 살짝 올려 웃고 있어.',
  옷: '검은색 재킷 위에 흰색 티셔츠를 입었고, 하의는 진한 회색 바지야. 재킷엔 지퍼가 있어.',
  장신구: '없음'
};

const AiFeedbackReview = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = createSignal(false);
  const [showScoreBoard, setShowScoreBoard] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(-1);
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false);
  const [showConfirmButton, setShowConfirmButton] = createSignal(false);
  const [scores, setScores] = createSignal<PromptScores | null>(null);
  const [isEvaluating, setIsEvaluating] = createSignal(false);
  const [currentPlayingScriptIndex, setCurrentPlayingScriptIndex] = createSignal<number | null>(null);
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();

  const backgroundImageStyle = getS3ImageURL('sunsetOfMoai.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;

  const currentScript = () => {    
    const index = currentScriptIndex();
    if (index < 0 || index >= aiFeedbackReviewScripts.length) return null;
    return aiFeedbackReviewScripts[index];
  };

  // 자동 진행 타이머 취소
  const cancelAutoProceed = () => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  };

  // 다음 스크립트로 진행
  const proceedToNext = () => {
    cancelAutoProceed();
    const nextIndex = currentScriptIndex() + 1;
    
    if (nextIndex < aiFeedbackReviewScripts.length) {
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      setCurrentPlayingScriptIndex(null);
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
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
        setWasSkipped(true);
      }
    },
    onSecondSkip: () => {
      cancelAutoProceed();
      audioPlayback.stopAudio();
      // 자동 진행 제거 - 사용자가 버튼을 눌러야 함
    },
  });

  // 스크립트 변경 시 처리
  createEffect(() => {
    const script = currentScript();
    if (!script) return;
    const scriptIndex = currentScriptIndex();

    // 오디오 재생 로직
    const isNewScript = currentPlayingScriptIndex() !== scriptIndex;
    if (isNewScript) {
      setCurrentPlayingScriptIndex(scriptIndex);
      audioPlayback.playAudio(script.voice, {
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

  // 프롬프트 평가 함수
  const evaluateUserPrompts = async () => {
    setIsEvaluating(true);
    try {
      const isDev = import.meta.env.DEV;
      
      let sunsetPrompt: string;
      let characterPrompt: string;

      if (isDev) {
        // 개발환경: 고정 프롬프트 사용
        sunsetPrompt = DEV_SUNSET_PROMPT;
        const charDesc = DEV_CHARACTER_PROMPT;
        characterPrompt = `캐릭터 디자인: 얼굴: ${charDesc.얼굴}. 옷: ${charDesc.옷}. ${charDesc.장신구 !== '없음' ? `장신구: ${charDesc.장신구}.` : ''}`;
      } else {
        // 배포환경: 스토어에서 가져오기
        sunsetPrompt = useDescribeImageStore.getState().userPrompt || '';
        const charPrompt = useCharacterImageStore.getState().prompt || '';
        characterPrompt = charPrompt;
      }

      // 프롬프트가 비어있으면 기본값 사용
      if (!sunsetPrompt || !characterPrompt) {
        sunsetPrompt = sunsetPrompt || DEV_SUNSET_PROMPT;
        const charDesc = DEV_CHARACTER_PROMPT;
        characterPrompt = characterPrompt || `캐릭터 디자인: 얼굴: ${charDesc.얼굴}. 옷: ${charDesc.옷}.`;
      }

      const evaluatedScores = await evaluatePrompts(sunsetPrompt, characterPrompt);
      setScores(evaluatedScores);
    } catch (error) {
      // 기본 점수 및 피드백 설정
      setScores({ 
        specificity: 2, 
        clarity: 2, 
        contextuality: 2,
        feedback: {
          specificity: '구체적인 세부사항을 더 추가해보면 좋아요!',
          clarity: '표현을 더 명확하게 하면 이해도가 올라가요!',
          contextuality: '상황이나 맥락을 추가하면 더 완벽해져요!'
        }
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  onMount(async () => {
    // 배경 이미지 프리로드
    try {
      await preloadImages([backgroundImageStyle]);
      setIsReady(true);
    } catch (error) {
      setIsReady(true);
    }

    // 프롬프트 평가 시작 (백그라운드에서 실행)
    evaluateUserPrompts();

    // 사용자 상호작용 감지하여 오디오 컨텍스트 활성화
    const handleUserInteraction = () => {
      activateAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // 1초 후에도 자동으로 시도
    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);
  });

  onCleanup(() => {
    cancelAutoProceed();
  });

  const currentScriptImage = () => {
    const script = currentScript();
    if (!script || !script.maiPng) return null;
    
    return (
      <img 
        src={getS3ImageURL(script.maiPng)} 
        alt="MAI" 
        style={{ width: '330px' }}
      />
    );
  };

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div  
        class={pageContainerStyles.container}
        style={{
          position: 'relative',
          display: 'flex',
          'align-items': 'center',
          'flex-direction': 'column-reverse',
          padding: '1rem 2rem 1rem',
        }}>
          {/* 배경 이미지 레이어 (투명도 적용) */}
          <div
            class={styles.backgroundLayer}
            style={{
              'background-image': backgroundImageStyleURL,
            }}
          />
          <Show when={!showScoreBoard()}>
          {/* 내용물 레이어 */}
            <div class={styles.contentLayer}>
              <Show when={currentScript()}>
                <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center' }}>
                  {currentScriptImage()}
                  <SpeechBubble 
                    message={typingAnimation.displayedMessage()}
                    showNavigation={true}
                    onNext={proceedToNext}
                    onPrev={proceedToPrev}
                    scriptHistory={aiFeedbackReviewScripts.map(s => ({ id: s.id, script: s.script }))}
                    currentScriptIndex={currentScriptIndex()}
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
                      return isComplete && currentScriptIndex() < aiFeedbackReviewScripts.length - 1;
                    }}
                    canGoPrev={() => currentScriptIndex() > 0}
                  />
                </div>
              </Show>
              <Show when={showConfirmButton()}>
                <div style={{ 
                  position: 'absolute',
                  bottom: '1%',
                  left: '82%',
                  transform: 'translateX(-50%)',
                }}>
                  <ConfirmButton 
                    onClick={() => setShowScoreBoard(true)} 
                    text="다음 수업으로"
                  />
                </div>
              </Show>
            </div>
          </Show>
          <Show when={showScoreBoard()}>
            <ScoreBoard 
              scores={scores()}
              onWorldMap={() => {
                // 월드맵으로 이동 (Solid Router)
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
  );
};

export default AiFeedbackReview;
