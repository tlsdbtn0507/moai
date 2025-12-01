import { Show, onMount, createSignal, createEffect, onCleanup } from 'solid-js';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './ImportanceOfPrompting.module.css';
import { importanceOfPromptingScripts, ScriptInterface } from '../../data/scripts/1-3';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';

const ImportanceOfPrompting = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [currentTitle, setCurrentTitle] = createSignal<string | undefined>(undefined);
  const [currentConcept, setCurrentConcept] = createSignal(importanceOfPromptingScripts[0]?.concept || '');
  const [characterImageUrl, setCharacterImageUrl] = createSignal(getS3ImageURL('1-3/pointingMai.png'));
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false); // 스킵 상태 추적
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null; // 자동 진행 타이머
  
  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  
  // 오디오 재생 훅
  const audioPlayback = useAudioPlayback();

  // 현재 스크립트 가져오기
  const currentScript = () => importanceOfPromptingScripts[currentScriptIndex()];
  
  // 스크립트 ID가 4~7일 때 compareFlower1.png 표시 여부
  const shouldShowCompareFlower = () => {
    const script = currentScript();
    return script && script.id >= 4 && script.id <= 7;
  };

  // 스크립트 ID가 5~7일 때 compareFlower2.png 표시 여부
  const shouldShowCompareFlower2 = () => {
    const script = currentScript();
    return script && script.id >= 5 && script.id <= 7;
  };


  const shouldShowGoodPromptExplanation = () => {
    const script = currentScript();
    return script && script.id >= 11;
  }


  // 자동 진행 타이머 취소
  const cancelAutoProceed = () => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  };

  // 다음 스크립트로 진행
  const proceedToNext = () => {
    cancelAutoProceed(); // 타이머 취소
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < importanceOfPromptingScripts.length) {
      // 스킵 상태 초기화 (다음 스크립트에서 다시 타이핑 애니메이션 가능하도록)
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      // 오디오 정지 (다음 스크립트 재생을 위해)
      audioPlayback.stopAudio();
      // 약간의 딜레이 후 스크립트 인덱스 변경 (오디오 정지가 완료되도록)
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
    }
  };

  // 클릭 이벤트 핸들러 (다음 스크립트로 진행) - 선택적으로 사용 가능
  const handleClick = () => {
    if (currentScriptIndex() < importanceOfPromptingScripts.length - 1) {
      proceedToNext();
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
        setWasSkipped(true); // 스킵 상태 표시
        // cancelAutoProceed(); // 자동 진행 취소
      }
    },
    onSecondSkip: () => {
      cancelAutoProceed(); // 자동 진행 타이머 취소
      audioPlayback.stopAudio();
      // 마지막 스크립트가 아니면 다음으로 진행
      if (currentScriptIndex() < importanceOfPromptingScripts.length - 1) {
        proceedToNext();
      }
    },
  });

  // 스크립트 변경 시 처리
  createEffect(() => {
    const script = currentScript();
    if (!script) return;
    const scriptIndex = currentScriptIndex();

    // title 업데이트
    setCurrentTitle(script.title);
    
    // concept 업데이트
    setCurrentConcept(script.concept);
    
    // 캐릭터 이미지 업데이트
    setCharacterImageUrl(getS3ImageURL(script.maiPng));

    // 오디오 재생 로직
    // 첫 번째 스킵 시에는 오디오가 이미 재생 중이므로 재생하지 않음
    // 그 외의 경우에는 항상 재생 (스크립트가 변경되었으므로)
    if (!wasSkipped() || !audioPlayback.isPlaying()) {
      audioPlayback.playAudio(script.voice, {
        onEnded: () => {
          // 오디오 재생 완료 후 처리
          if (scriptIndex < importanceOfPromptingScripts.length - 1) {
            // 스킵을 했으면 0.5초 대기 후 자동 진행 (대기 중 추가 입력이 있으면 취소됨)
            if (wasSkipped()) {
              cancelAutoProceed(); // 기존 타이머 취소
              autoProceedTimeout = setTimeout(() => {
                proceedToNext();
              }, 500);
            } else {
              // 스킵을 하지 않았으면 즉시 진행
              proceedToNext();
            }
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
    
    // 빈 오디오를 재생하여 오디오 컨텍스트 활성화
    const emptyAudio = new Audio();
    emptyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    emptyAudio.volume = 0.01;
    emptyAudio.play().then(() => {
      emptyAudio.pause();
      setAudioContextActivated(true);
      // 오디오 컨텍스트 활성화 후 첫 번째 스크립트 시작
      setTimeout(() => {
        setCurrentScriptIndex(0);
      }, 100);
    }).catch(() => {
      // 실패해도 계속 진행 (사용자가 이미 상호작용했을 수 있음)
      setAudioContextActivated(true);
      setTimeout(() => {
        setCurrentScriptIndex(0);
      }, 100);
    });
  };

  onMount(async () => {
    // 모든 이미지 프리로드
    const imageUrls = importanceOfPromptingScripts.map(script => getS3ImageURL(script.maiPng));
    try {
      await preloadImages(imageUrls);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true);
    }

    // 사용자 상호작용 감지하여 오디오 컨텍스트 활성화
    const handleUserInteraction = () => {
      activateAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // 1초 후에도 자동으로 시도 (사용자가 이미 상호작용했을 수 있음)
    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);
  });

  onCleanup(() => {
    cancelAutoProceed();
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        class={pageContainerStyles.container}
        style={{
          position: 'relative',
          'background-color': '#A9E0FF',
          'background-size': 'cover',
          'background-position': 'center',
          display: 'flex',
          'align-items': 'center',
          'flex-direction': 'column-reverse',
          padding: '1rem 2rem 1rem',
        }}
      >
        <div class={styles.modal}>
          <Show when={currentTitle()} fallback={<h1 class={styles.title}>프롬프팅</h1>}>
            <h1 class={styles.title}>{currentTitle()}</h1>
          </Show>
          <Show when={currentConcept()}>
            <div class={styles.conceptContainer}>
              <span class={styles.conceptTitle}>개념</span>
              <span class={styles.conceptDescription}>{currentConcept()}</span>
            </div>
          </Show>
          <div class={styles.content}>
            <div class={styles.speechBubbleContainer}>
              <SpeechBubble message={typingAnimation.displayedMessage()} size={600} />
            </div>
              <Show when={shouldShowCompareFlower()}>
              <img
                src={getS3ImageURL('1-3/compareFlower1.png')}
                alt="Compare Flower"
                style={{
                  'z-index': 10,
                  position: 'absolute',
                  width: '150px',
                  top: '24%',
                  height: '250px',
                  left: '30%',
                }}
              />
              </Show>
              <Show when={shouldShowCompareFlower2()}>

                <img
                  src={getS3ImageURL('1-3/compareFlower2.png')}
                  alt="Compare Flower"
                  style={{
                    'z-index': 10,
                    position: 'absolute',
                    width: '150px',
                    top: '24%',
                    height: '250px',
                    left: '54%',
                  }}
                />
              </Show>
              <Show when={shouldShowGoodPromptExplanation()}>
                <div class={styles.goodPromptExplanation}>
                  <div class={styles.goodPromptExample}>
                    <img src={getS3ImageURL('1-3/specificity.png')} alt="" />
                    <span
                      style={{
                        color: currentScript()?.id === 12 ? '#3FB5DB' : undefined,
                      }}
                    >
                      구체성
                    </span>
                  </div>
                  <div class={styles.goodPromptExample}>
                    <img src={getS3ImageURL('1-3/clarity.png')} alt="" />
                    <span
                      style={{
                        color: currentScript()?.id === 13 ? '#3FB5DB' : undefined,
                      }}
                    >
                      명확성
                    </span>
                  </div>
                  <div class={styles.goodPromptExample}>
                    <img src={getS3ImageURL('1-3/contextuality.png')} alt="" />
                    <span
                      style={{
                        color: currentScript()?.id === 14 ? '#3FB5DB' : undefined,
                      }}
                    >
                      맥락성
                    </span>
                  </div>
                </div>
              </Show>
            <div 
              class={styles.characterContainer}
              style={{
                left: currentScriptIndex() >= 8 ? '66%' : '60%',
              }}
            >
              <img
                src={characterImageUrl()}
                alt="MAI"
                class={styles.character}
              />
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ImportanceOfPrompting;
