import { Show, onMount, createSignal, onCleanup, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './DetermineInfoReview.module.css';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { LoadingSpinner } from '../LoadingSpinner';
import { SpeechBubble } from '../SpeechBubble';
import { ScoreBoard } from '../1-3/ScoreBoard';
import { feedbackScripts } from '../../data/scripts/2-7';
import { useMoaiConversation, type MoaiConversationScript } from '../../utils/hooks/useMoaiConversation';
import { callGPT4MiniWithSafety, type PromptScores } from '../../utils/gptChat';

// feedbackScripts를 MoaiConversationScript 형식으로 변환
const reviewScripts: MoaiConversationScript[] = feedbackScripts.map(script => ({
  script: script.script,
  voice: script.voiceUrl,
  maiPic: script.maiPic,
}));

const DetermineInfoReview = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [displayCharacterUrl, setDisplayCharacterUrl] = createSignal<string | null>(null);
  const [showScoreBoard, setShowScoreBoard] = createSignal(false);
  const [scores, setScores] = createSignal<PromptScores | null>(null);
  const [isEvaluating, setIsEvaluating] = createSignal(false);
  const navigate = useNavigate();

  const reviewBg = getS3ImageURL('2-7/desk.png');
  const reviewBgStyle = `url(${reviewBg})`;

  // useMoaiConversation 훅 사용
  const conversation = useMoaiConversation(
    () => reviewScripts,
    () => {
      // 모든 스크립트 완료 시 처리 (버튼 표시는 별도로 처리)
    },
    { typingSpeed: 150 }
  );

  // 2-7용 프롬프트 평가 함수
  const evaluateDetermineInfoPrompts = async (): Promise<PromptScores> => {
    // 로컬 스토리지에서 사용자 입력 데이터 가져오기
    const userInput = localStorage.getItem('determineInfoPracticeAnswer') || '';

    if (!userInput || userInput.trim().length === 0) {
      // 데이터가 없으면 기본 피드백 반환
      return {
        specificity: 2,
        clarity: 2,
        contextuality: 2,
        feedback: {
          specificity: 'AI 정보 판단 능력을 더 향상시켜보세요!',
          clarity: '판단력을 더 키워보세요!',
          contextuality: '구성력을 더 발전시켜보세요!'
        }
      };
    }

    const evaluationPrompt = `다음은 사용자가 AI의 정보 출처를 판단하고 검증한 내용입니다:

"${userInput}"

이 내용을 다음 세 가지 기준으로 평가해주세요:
- 정확성 (specificity): 정보의 정확성을 얼마나 잘 판단했는가? (2점: 보통, 3점: 매우 정확) - 최소 2점부터 시작
- 판단력 (clarity): AI 정보의 신뢰성을 얼마나 잘 판단했는가? (2점: 보통, 3점: 매우 우수) - 최소 2점부터 시작
- 구성력 (contextuality): 검증 과정을 얼마나 체계적으로 구성했는가? (2점: 보통, 3점: 매우 체계적) - 최소 2점부터 시작

참고: 점수는 2점 또는 3점만 부여해주세요. 1점은 거의 주지 않도록 해주세요.

각 항목에 대해 점수와 함께 친근하고 격려하는 톤의 피드백을 작성해주세요.
**중요: 각 피드백은 반드시 4줄 이하로 간결하게 작성해주세요.**

응답 형식은 반드시 다음 JSON 형식으로만 답변해주세요:
{
  "specificity": 1-3,
  "clarity": 1-3,
  "contextuality": 1-3,
  "feedback": {
    "specificity": "정확성에 대한 피드백 (친근하고 격려하는 톤)",
    "clarity": "판단력에 대한 피드백 (친근하고 격려하는 톤)",
    "contextuality": "구성력에 대한 피드백 (친근하고 격려하는 톤)"
  }
}`;

    try {
      const messages = [
        {
          role: 'system' as const,
          content: '당신은 AI 정보 판단 평가 전문가입니다. 주어진 평가를 객관적이고 정확하게 분석합니다. 반드시 JSON 형식으로만 응답합니다.',
        },
        {
          role: 'user' as const,
          content: evaluationPrompt,
        },
      ];

      // 평가용 내부 프롬프트이므로 입력 검증 스킵, 출력 검증만 수행
      const response = await callGPT4MiniWithSafety(messages, {
        skipInputValidation: true,
        skipOutputValidation: false,
      });
      
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
            specificity: 'AI 정보 판단 능력을 더 향상시켜보세요!',
            clarity: '판단력을 더 키워보세요!',
            contextuality: '구성력을 더 발전시켜보세요!'
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
          specificity: 'AI 정보 판단 능력을 더 향상시켜보세요!',
          clarity: '판단력을 더 키워보세요!',
          contextuality: '구성력을 더 발전시켜보세요!'
        }
      };
    } catch (error) {
      // 기본값 반환
      return {
        specificity: 2,
        clarity: 2,
        contextuality: 2,
        feedback: {
          specificity: 'AI 정보 판단 능력을 더 향상시켜보세요!',
          clarity: '판단력을 더 키워보세요!',
          contextuality: '구성력을 더 발전시켜보세요!'
        }
      };
    }
  };

  // 프롬프트 평가 함수
  const evaluateUserPrompts = async () => {
    setIsEvaluating(true);
    try {
      const evaluatedScores = await evaluateDetermineInfoPrompts();
      setScores(evaluatedScores);
    } catch (error) {
      // 기본 점수 및 피드백 설정
      setScores({ 
        specificity: 2, 
        clarity: 2, 
        contextuality: 2,
        feedback: {
          specificity: 'AI 정보 판단 능력을 더 향상시켜보세요!',
          clarity: '판단력을 더 키워보세요!',
          contextuality: '구성력을 더 발전시켜보세요!'
        }
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // 마지막 스크립트 이후 점수판 표시
  const goToNextStep = () => {
    // 피드백 평가 시작
    evaluateUserPrompts();
    // 바로 ScoreBoard 표시
    setShowScoreBoard(true);
  };

  // 스크립트 변경 시 캐릭터 이미지 업데이트
  createEffect(() => {
    const script = conversation.currentScript();
    if (script && 'maiPic' in script && script.maiPic) {
      const newCharUrl = getS3ImageURL(script.maiPic);
      setDisplayCharacterUrl(newCharUrl);
    }
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
    }).catch(() => {
      setAudioContextActivated(true);
    });
  };

  // 이미지 프리로드 및 초기화
  onMount(async () => {
    // 모든 캐릭터 이미지 URL 수집
    const imageUrls = reviewScripts
      .map(script => (script.maiPic ? getS3ImageURL(script.maiPic) : null))
      .filter(Boolean) as string[];
    
    try {
      await preloadImages([reviewBg, ...imageUrls]);
      setIsReady(true);
    } catch (error) {
      setIsReady(true);
    }

    // 사용자 상호작용 대기
    const handleUserInteraction = () => {
      activateAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // 1초 후 자동 활성화
    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);
  });

  onCleanup(() => {
    // 정리 작업 (필요시)
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
        <div class={pageContainerStyles.container} style={{'background-image': reviewBgStyle}}>
         <div class={styles.contentCard}>
          <Show when={!showScoreBoard()}>
            <Show when={displayCharacterUrl()}>
              <div class={styles.contentWrapper}>
                <img
                  src={displayCharacterUrl()!}
                  alt="MAI"
                  class={styles.characterImage}
                />
                <SpeechBubble 
                  message={conversation.displayedMessage()} 
                  showNavigation={true}
                  onNext={conversation.proceedToNext}
                  onPrev={conversation.proceedToPrev}
                  isComplete={conversation.isComplete}
                  canGoNext={() => {
                    return conversation.isComplete() && !conversation.isLastScript();
                  }}
                  canGoPrev={() => conversation.currentScriptIndex() > 0}
                />
              </div>
            </Show>

            <Show when={conversation.isLastScript() && conversation.isComplete()}>
              <div class={styles.buttonContainer}>
                <button
                  onClick={goToNextStep}
                  class={`${styles.button} ${styles.buttonPrimary}`}
                >
                  다음으로
                </button>
              </div>
            </Show>
          </Show>
        </div>
        {/* 점수판 */}
        <Show when={showScoreBoard()}>
            <ScoreBoard 
              scores={scores()}
              labels={{
                specificity: '정확성',
                clarity: '판단력',
                contextuality: '구성력',
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
  );
};

export default DetermineInfoReview;
