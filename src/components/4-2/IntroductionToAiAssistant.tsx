import { Show, onMount, createSignal, createEffect, onCleanup, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages, getS3TTSURL } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './IntroductionToAiAssistant.module.css';
import { introductionScripts } from '../../data/scripts/4-2';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';

const IntroductionToAiAssistant = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [characterImageUrl, setCharacterImageUrl] = createSignal(getS3ImageURL('4-2/pocketMai.png'));
  const [backgroundImageUrl, setBackgroundImageUrl] = createSignal(getS3ImageURL('4-2/maiCity.png'));
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false);
  const [showCharacterDropdown, setShowCharacterDropdown] = createSignal(false);
  const [isFading, setIsFading] = createSignal(false);
  const [isFadeOut, setIsFadeOut] = createSignal(false);
  const [displayBackgroundUrl, setDisplayBackgroundUrl] = createSignal(getS3ImageURL('4-2/maiCity.png'));
  const [displayCharacterUrl, setDisplayCharacterUrl] = createSignal(getS3ImageURL('4-2/pocketMai.png'));
  const [currentPlayingScriptIndex, setCurrentPlayingScriptIndex] = createSignal<number | null>(null);
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  const navigate = useNavigate();
  const params = useParams();
  
  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  
  // 오디오 재생 훅
  const audioPlayback = useAudioPlayback();

  // 현재 스크립트 가져오기
  const currentScript = () => introductionScripts[currentScriptIndex()];
  
  // 자동 진행 타이머 취소
  const cancelAutoProceed = () => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  };

  // 마지막 스크립트 이후 다음 단계(4/3/2)로 이동
  const goToNextStep = () => {
    const worldId = params.worldId || '4';
    const classId = params.classId || '3';
    const nextStepId = '2';
    navigate(`/${worldId}/${classId}/${nextStepId}`);
  };

  // 다시듣기: 첫 번째 스크립트로 돌아가기
  const restartFromBeginning = () => {
    cancelAutoProceed();
    audioPlayback.stopAudio();
    typingAnimation.resetSkipState();
    setWasSkipped(false);
    setCurrentScriptIndex(0);
  };

  // 캐릭터 설명으로 이동
  const goToCharacterScript = (characterId: number) => {
    cancelAutoProceed();
    audioPlayback.stopAudio();
    typingAnimation.resetSkipState();
    setWasSkipped(false);
    const scriptIndex = introductionScripts.findIndex(script => script.id === characterId);
    if (scriptIndex !== -1) {
      setCurrentScriptIndex(scriptIndex);
    }
    setShowCharacterDropdown(false);
  };

  // 마지막 스크립트인지 확인
  const isLastScript = () => {
    return currentScriptIndex() >= introductionScripts.length - 1;
  };

  // 다음 스크립트로 진행
  const proceedToNext = () => {
    cancelAutoProceed();
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < introductionScripts.length) {
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      setCurrentPlayingScriptIndex(null); // 오디오 재생 인덱스 리셋
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
      setCurrentPlayingScriptIndex(null); // 오디오 재생 인덱스 리셋
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
        // 타이핑 애니메이션만 스킵하고, 오디오는 계속 재생되도록 함
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

  // 배경 이미지 변경 시 fade 애니메이션 처리 (배경, 캐릭터, 대사 모두에 적용)
  createEffect(() => {
    const newBgUrl = backgroundImageUrl();
    const currentBgUrl = displayBackgroundUrl();
    
    if (newBgUrl !== currentBgUrl && currentBgUrl) {
      // fade-out 시작 (배경, 캐릭터, 대사 모두)
      setIsFading(true);
      setIsFadeOut(true);
      
      // fade-out 완료 후 이미지 변경 및 fade-in 시작
      setTimeout(() => {
        setDisplayBackgroundUrl(newBgUrl);
        // 캐릭터 이미지도 함께 업데이트
        setDisplayCharacterUrl(characterImageUrl());
        setIsFadeOut(false); // fade-in 시작
      }, 600); // fade-out 시간
      
      // fade-in 완료 후 (총 1200ms = fade-out 600ms + fade-in 600ms)
      setTimeout(() => {
        setIsFading(false);
      }, 1200); // fade-out + fade-in 시간
    } else if (!currentBgUrl) {
      // 초기 로드 시 바로 설정
      setDisplayBackgroundUrl(newBgUrl);
      setDisplayCharacterUrl(characterImageUrl());
    }
  });

  // 캐릭터 이미지 변경 시 (배경 변경 없을 때는 바로 업데이트)
  createEffect(() => {
    const newCharUrl = characterImageUrl();
    const currentCharUrl = displayCharacterUrl();
    
    // 배경이 fade 중이 아닐 때만 바로 업데이트
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
    
    // 배경 이미지 업데이트
    if (script.bgPng) {
      setBackgroundImageUrl(getS3ImageURL(script.bgPng));
    }

    // 오디오 재생 로직
    // 스크립트 인덱스가 변경되었을 때만 오디오 재생
    // 같은 스크립트에 대해 오디오가 이미 재생 중이면 재생하지 않음
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
    // 타이핑 애니메이션이 스킵된 상태가 아니면 시작
    if (!typingAnimation.isTypingSkipped()) {
    typingAnimation.startTyping(script.script);
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
    const imageUrls = introductionScripts
      .map(script => [
        script.maiPng ? getS3ImageURL(script.maiPng) : null,
        script.bgPng ? getS3ImageURL(script.bgPng) : null,
      ])
      .flat()
      .filter(Boolean) as string[];
      
    try {
      await preloadImages(imageUrls);
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

    // 드롭다운 외부 클릭 시 닫기
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-character-dropdown]')) {
        setShowCharacterDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  onCleanup(() => {
    cancelAutoProceed();
  });

  const currentScriptData = () => currentScript();
  
  // id에 따라 SpeechBubble type 결정 (반응형으로 만들기)
  const speechBubbleType = createMemo((): 'smartie' | 'kylie' | 'logos' | undefined => {
    const scriptId = currentScriptData()?.id;
    if (!scriptId) return undefined;
    
    if (scriptId >= 17 && scriptId <= 20) {
      return 'smartie';
    } else if (scriptId >= 21 && scriptId <= 25) {
      return 'kylie';
    } else if (scriptId >= 26 && scriptId <= 28) {
      return 'logos';
    }
    return undefined;
  });

  // 완료 여부 확인 (반응형)
  const isComplete = createMemo(() => {
    const script = currentScript();
    if (!script) return false;
    const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
    const isAudioComplete = !audioPlayback.isPlaying();
    // 스킵된 경우 오디오 재생 여부와 관계없이 완료로 간주
    if (typingAnimation.isTypingSkipped() || wasSkipped()) {
      return isTypingComplete;
    }
    return isTypingComplete && isAudioComplete;
  });

  // 다음 버튼 표시 여부
  const shouldShowNextButton = createMemo(() => {
    if (!isComplete()) return false;
    const script = currentScript();
    if (!script) return false;
    return currentScriptIndex() < introductionScripts.length - 1;
  });

  // 이전 버튼 표시 여부
  const shouldShowPrevButton = createMemo(() => {
    if (!isComplete()) return false;
    return currentScriptIndex() > 0;
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        class={`${pageContainerStyles.container} ${styles.container} ${isFadeOut() ? styles.fadeOut : styles.fadeIn} ${isFading() ? styles.fading : ''}`}
        style={{
          'background-image': `url(${displayBackgroundUrl()})`,
        }}
      >
        <div 
          class={styles.contentWrapper}
          style={{
            position: (currentScriptData()?.id && currentScriptData()!.id >= 3 && currentScriptData()!.id <= 8) ? 'absolute' : undefined,
            top: (currentScriptData()?.id && currentScriptData()!.id >= 3 && currentScriptData()!.id <= 8) ? '80%' : undefined,
          }}
        >
          <Show when={currentScriptData()?.maiPng && !isFading()}>
            <img
              src={displayCharacterUrl()}
              alt="MAI"
              class={`${styles.characterImage} ${styles.fadeIn}`}
            />
          </Show>
          <Show when={currentScriptData()?.speechBubble && !isFading()}>
            <div class={`${styles.speechBubbleWrapper} ${styles.fadeIn}`}>
              <SpeechBubble 
                message={typingAnimation.displayedMessage()} 
                size={800} 
                type={speechBubbleType()}
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
                  return isComplete && currentScriptIndex() < introductionScripts.length - 1;
                }}
                canGoPrev={() => currentScriptIndex() > 0}
                scriptHistory={introductionScripts.slice(0, currentScriptIndex() + 1).map(script => ({
                  id: script.id,
                  script: script.script,
                }))}
                currentScriptIndex={currentScriptIndex()}
              />
            </div>
          </Show>
          
          <Show when={!currentScriptData()?.speechBubble && currentScriptData()?.scriptBgLine && !isFading()}>
            <div class={`${styles.scriptBgLine} ${styles.fadeIn}`} style={{ position: 'relative' }}>
              {typingAnimation.displayedMessage()}
              <Show when={shouldShowPrevButton()}>
                <button
                  onClick={proceedToPrev}
                  class={styles.navButtonPrev}
                >
                  이전
                </button>
              </Show>
              <Show when={shouldShowNextButton()}>
                <button
                  onClick={proceedToNext}
                  class={styles.navButtonNext}
                >
                  다음
                </button>
              </Show>
            </div>
          </Show>

          <Show when={!currentScriptData()?.speechBubble && !currentScriptData()?.scriptBgLine && !isFading()}>
            <div class={`${styles.plainText} ${styles.fadeIn}`} style={{ position: 'relative' }}>
              {typingAnimation.displayedMessage()}
              <Show when={shouldShowPrevButton()}>
                <button
                  onClick={proceedToPrev}
                  class={styles.navButtonPrev}
                >
                  이전
                </button>
              </Show>
              <Show when={shouldShowNextButton()}>
                <button
                  onClick={proceedToNext}
                  class={styles.navButtonNext}
                >
                  다음
                </button>
              </Show>
            </div>
          </Show>
        </div>

        <Show when={isLastScript() && (typingAnimation.displayedMessage().length === currentScript()?.script.length || wasSkipped())}>
          <div class={styles.buttonContainer}>
            <button
              onClick={restartFromBeginning}
              class={`${styles.button} ${styles.buttonSecondary}`}
            >
              처음부터 다시듣기
            </button>
            <div class={styles.dropdownContainer} data-character-dropdown>
              <button
                onClick={() => setShowCharacterDropdown(!showCharacterDropdown())}
                class={`${styles.button} ${styles.buttonSecondary}`}
              >
                캐릭터 다시 듣기
              </button>
              <Show when={showCharacterDropdown()}>
                <div class={styles.dropdown}>
                  <button
                    onClick={() => goToCharacterScript(17)}
                    class={`${styles.dropdownItem} ${styles.dropdownItemFirst}`}
                  >
                    스마티
                  </button>
                  <button
                    onClick={() => goToCharacterScript(21)}
                    class={styles.dropdownItem}
                  >
                    카일리
                  </button>
                  <button
                    onClick={() => goToCharacterScript(26)}
                    class={`${styles.dropdownItem} ${styles.dropdownItemLast}`}
                  >
                    로고스
                  </button>
                </div>
              </Show>
            </div>
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
  );
};

export default IntroductionToAiAssistant;

