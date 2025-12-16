import { Show, onMount, createSignal, createEffect, onCleanup } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
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
  const [currentPlayingScriptIndex, setCurrentPlayingScriptIndex] = createSignal<number | null>(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false); // 모달 상태
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null; // 자동 진행 타이머
  let conceptDescriptionRef: HTMLSpanElement | undefined; // concept description ref
  const navigate = useNavigate();
  const params = useParams();
  
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

  // 묶음 내부 스크립트인지 확인 (4-5, 6-7, 9-10, 12-13-14)
  const isInGroup = () => {
    const script = currentScript();
    if (!script) return false;
    const id = script.id;
    return (id === 4 || id === 5) || // 묶음 1: 4-5
           (id === 6 || id === 7) || // 묶음 2: 6-7
           (id === 9 || id === 10) || // 묶음 3: 9-10
           (id === 12 || id === 13 || id === 14); // 묶음 4: 12-13-14
  };

  // 묶음의 첫 번째 스크립트인지 확인 (자동 진행이 필요한 스크립트)
  // 묶음 12-13-14의 경우 12와 13 모두 자동 진행 필요
  const shouldAutoProceed = () => {
    const script = currentScript();
    return script && (script.id === 4 || script.id === 6 || script.id === 9 || script.id === 12 || script.id === 13);
  };

  // 묶음의 마지막 스크립트인지 확인
  const isLastInGroup = () => {
    const script = currentScript();
    if (!script) return false;
    const id = script.id;
    return id === 5 || id === 7 || id === 10 || id === 14;
  };

  // 묶음 시작 전 스크립트 인덱스 찾기
  const getGroupStartPrevIndex = () => {
    const script = currentScript();
    if (!script) return -1;
    const id = script.id;
    
    // 각 묶음의 시작 전 인덱스 찾기
    if (id === 5) {
      // 묶음 4-5의 시작 전은 3
      return importanceOfPromptingScripts.findIndex(s => s.id === 3);
    } else if (id === 7) {
      // 묶음 6-7의 시작 전은 5
      return importanceOfPromptingScripts.findIndex(s => s.id === 5);
    } else if (id === 10) {
      // 묶음 9-10의 시작 전은 8
      return importanceOfPromptingScripts.findIndex(s => s.id === 8);
    } else if (id === 14) {
      // 묶음 12-13-14의 시작 전은 11
      return importanceOfPromptingScripts.findIndex(s => s.id === 11);
    }
    return -1;
  };


  // 자동 진행 타이머 취소
  const cancelAutoProceed = () => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  };

  // 마지막 스크립트 이후 다음 단계(1/3/4)로 이동
  const goToNextStep = () => {
    const worldId = params.worldId || '1';
    const classId = params.classId || '3';
    const nextStepId = '4';
    navigate(`/${worldId}/${classId}/${nextStepId}`);
  };

  // 다시듣기: 첫 번째 스크립트로 돌아가기
  const restartFromBeginning = () => {
    cancelAutoProceed(); // 타이머 취소
    audioPlayback.stopAudio(); // 오디오 정지
    typingAnimation.resetSkipState(); // 스킵 상태 초기화
    setWasSkipped(false); // 스킵 상태 초기화
    setCurrentPlayingScriptIndex(null);
    setCurrentScriptIndex(0); // 첫 번째 스크립트로 리셋
  };

  // 마지막 스크립트인지 확인
  const isLastScript = () => {
    return currentScriptIndex() >= importanceOfPromptingScripts.length - 1;
  };

  // 다음 스크립트로 진행
  const proceedToNext = () => {
    cancelAutoProceed(); // 타이머 취소
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < importanceOfPromptingScripts.length) {
      // 스킵 상태 초기화 (다음 스크립트에서 다시 타이핑 애니메이션 가능하도록)
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      setCurrentPlayingScriptIndex(null);
      // 오디오 정지 (다음 스크립트 재생을 위해)
      audioPlayback.stopAudio();
      // 약간의 딜레이 후 스크립트 인덱스 변경 (오디오 정지가 완료되도록)
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
    } else {
      // 마지막 스크립트 이후에는 다음 단계로 이동
      goToNextStep();
    }
  };

  // 이전 스크립트로 진행
  const proceedToPrev = () => {
    cancelAutoProceed();
    
    // 묶음의 마지막 스크립트면 묶음 시작 전으로 이동
    if (isLastInGroup()) {
      const groupStartPrevIndex = getGroupStartPrevIndex();
      if (groupStartPrevIndex >= 0) {
        typingAnimation.resetSkipState();
        setWasSkipped(false);
        setCurrentPlayingScriptIndex(null);
        audioPlayback.stopAudio();
        setTimeout(() => {
          setCurrentScriptIndex(groupStartPrevIndex);
        }, 10);
      }
      return;
    }
    
    // 일반적인 이전 스크립트로 이동
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
        // wasSkipped는 설정하지 않음 - 오디오가 재생 중이면 계속 재생되도록
      }
    },
    onSecondSkip: () => {
      cancelAutoProceed(); // 자동 진행 타이머 취소
      audioPlayback.stopAudio();
      // 자동 진행 제거 - 사용자가 버튼을 눌러야 함
    },
  });

  // concept의 HTML 렌더링 처리
  createEffect(() => {
    const concept = currentConcept();
    if (conceptDescriptionRef) {
      conceptDescriptionRef.innerHTML = concept || '';
    }
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

  // 자동 진행 로직: 타이핑과 오디오가 완료되면 자동으로 다음 스크립트로 진행
  createEffect(() => {
    if (!shouldAutoProceed()) {
      // 자동 진행이 필요없는 경우 기존 타이머 취소
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }
    
    const script = currentScript();
    if (!script) return;

    const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
    const isAudioComplete = !audioPlayback.isPlaying();
    
    // 타이핑과 오디오가 모두 완료되었을 때만 자동 진행
    if (isTypingComplete && isAudioComplete) {
      // 이미 자동 진행이 예약되어 있으면 무시
      if (autoProceedTimeout) return;
      
      // 즉시 자동 진행 (묶음 내에서는 딜레이 없음)
      autoProceedTimeout = setTimeout(() => {
        const nextIndex = currentScriptIndex() + 1;
        if (nextIndex < importanceOfPromptingScripts.length) {
          typingAnimation.resetSkipState();
          setWasSkipped(false);
          setCurrentPlayingScriptIndex(null);
          audioPlayback.stopAudio();
          setTimeout(() => {
            setCurrentScriptIndex(nextIndex);
          }, 10);
        }
        autoProceedTimeout = null;
      }, 0); // 즉시 자동 진행
    } else {
      // 아직 완료되지 않았으면 기존 타이머 취소
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
    }
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
              <span 
                class={styles.conceptDescription} 
                ref={(el) => {
                  conceptDescriptionRef = el;
                  // ref가 설정될 때 현재 concept 값으로 초기화
                  if (el && currentConcept()) {
                    el.innerHTML = currentConcept() || '';
                  }
                }}
              ></span>
            </div>
          </Show>
          <div class={styles.content}>
            <div class={styles.speechBubbleContainer}>
              <SpeechBubble 
                message={typingAnimation.displayedMessage()} 
                size={600}
                type='simple'
                showNavigation={true}
                onNext={proceedToNext}
                onPrev={proceedToPrev}
                // 현재 대본 포함, 이전 대본까지만 표시
                scriptHistory={importanceOfPromptingScripts
                  .slice(0, currentScriptIndex() + 1)
                  .map(s => ({ id: s.id, script: s.script }))}
                currentScriptIndex={currentScriptIndex()}
                onModalStateChange={setIsModalOpen}
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
                  
                  // 자동 진행이 필요한 스크립트는 다음 버튼을 표시하지 않음
                  if (shouldAutoProceed()) {
                    return false;
                  }
                  
                  const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
                  const isAudioComplete = !audioPlayback.isPlaying();
                  // 스킵된 경우 오디오 재생 여부와 관계없이 완료로 간주
                  const isComplete = (typingAnimation.isTypingSkipped() || wasSkipped()) 
                    ? isTypingComplete 
                    : (isTypingComplete && isAudioComplete);
                  return isComplete && currentScriptIndex() < importanceOfPromptingScripts.length - 1;
                }}
                canGoPrev={() => {
                  // 묶음의 첫 번째 스크립트면 이전 버튼 숨김
                  if (shouldAutoProceed()) {
                    return false;
                  }
                  
                  // 묶음의 마지막 스크립트면 묶음 시작 전으로 이동 가능
                  if (isLastInGroup()) {
                    return getGroupStartPrevIndex() >= 0;
                  }
                  
                  // 일반적인 경우
                  return currentScriptIndex() > 0;
                }}
              />
            </div>
              <Show when={shouldShowCompareFlower()}>
              <img
                src={getS3ImageURL('1-3/compareFlower1.png')}
                alt="Compare Flower"
                style={{
                  'z-index': 0,
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
                    'z-index': 0,
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
                left: currentScriptIndex() >= 8 ? '69%' : '66%',
              }}
            >
              <img
                src={characterImageUrl()}
                alt="MAI"
                class={styles.character}
              />
            </div>
          </div>
          <Show when={isLastScript() && (typingAnimation.displayedMessage().length === currentScript()?.script.length || wasSkipped()) && !isModalOpen()}>
            <div class={styles.nextButtonContainer}>
              <button
                onClick={goToNextStep}
                class={styles.nextButton}
              >
                다음으로
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default ImportanceOfPrompting;
