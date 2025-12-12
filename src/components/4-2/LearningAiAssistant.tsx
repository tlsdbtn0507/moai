import { Show, onMount, createSignal, createEffect, onCleanup, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './LearningAiAssistant.module.css';
import { conceptStepScripts } from '../../data/scripts/4-2';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';

const LearningAiAssistant = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [characterImageUrl, setCharacterImageUrl] = createSignal(getS3ImageURL('4-2/pointingMai.png'));
  const [contentImageUrl, setContentImageUrl] = createSignal<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = createSignal(getS3ImageURL('4-2/maiCity.png'));
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false);
  const [currentPlayingScriptIndex, setCurrentPlayingScriptIndex] = createSignal<number | null>(null);
  const [isFading, setIsFading] = createSignal(false);
  const [isFadeOut, setIsFadeOut] = createSignal(false);
  const [displayBackgroundUrl, setDisplayBackgroundUrl] = createSignal(getS3ImageURL('4-2/maiCity.png'));
  const [displayCharacterUrl, setDisplayCharacterUrl] = createSignal(getS3ImageURL('4-2/pointingMai.png'));
  const [displayContentUrl, setDisplayContentUrl] = createSignal<string | null>(null);
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  const navigate = useNavigate();
  const params = useParams();
  
  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  
  // 오디오 재생 훅
  const audioPlayback = useAudioPlayback();

  // 현재 스크립트 가져오기
  const currentScript = () => conceptStepScripts[currentScriptIndex()];
  
  // 자동 진행 타이머 취소
  const cancelAutoProceed = () => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  };

  // 마지막 스크립트 이후 다음 단계(4/3/4)로 이동
  const goToNextStep = () => {
    const worldId = params.worldId || '4';
    const classId = params.classId || '3';
    const nextStepId = '4';
    navigate(`/${worldId}/${classId}/${nextStepId}`);
  };

  // 다시듣기: 첫 번째 스크립트로 돌아가기
  const restartFromBeginning = () => {
    cancelAutoProceed();
    audioPlayback.stopAudio();
    typingAnimation.resetSkipState();
    setWasSkipped(false);
    setCurrentPlayingScriptIndex(null);
    setCurrentScriptIndex(0);
  };

  // 마지막 스크립트인지 확인
  const isLastScript = () => {
    return currentScriptIndex() >= conceptStepScripts.length - 1;
  };

  // 다음 스크립트로 진행
  const proceedToNext = () => {
    cancelAutoProceed();
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < conceptStepScripts.length) {
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

  // 배경 이미지 변경 시 fade 애니메이션 처리
  createEffect(() => {
    const newBgUrl = backgroundImageUrl();
    const currentBgUrl = displayBackgroundUrl();
    
    if (newBgUrl !== currentBgUrl && currentBgUrl) {
      setIsFading(true);
      setIsFadeOut(true);
      
      setTimeout(() => {
        setDisplayBackgroundUrl(newBgUrl);
        setDisplayCharacterUrl(characterImageUrl());
        setDisplayContentUrl(contentImageUrl());
        setIsFadeOut(false);
      }, 600);
      
      setTimeout(() => {
        setIsFading(false);
      }, 1200);
    } else if (!currentBgUrl) {
      setDisplayBackgroundUrl(newBgUrl);
      setDisplayCharacterUrl(characterImageUrl());
      setDisplayContentUrl(contentImageUrl());
    }
  });

  // 캐릭터 이미지 변경 시
  createEffect(() => {
    const newCharUrl = characterImageUrl();
    const currentCharUrl = displayCharacterUrl();
    
    if (newCharUrl !== currentCharUrl && !isFading()) {
      setDisplayCharacterUrl(newCharUrl);
    }
  });

  // 콘텐츠 이미지 변경 시
  createEffect(() => {
    const newContentUrl = contentImageUrl();
    const currentContentUrl = displayContentUrl();
    
    if (newContentUrl !== currentContentUrl && !isFading()) {
      setDisplayContentUrl(newContentUrl);
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
    
    // 콘텐츠 이미지 업데이트
    if (script.content) {
      setContentImageUrl(getS3ImageURL(script.content));
    } else {
      setContentImageUrl(null);
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
    const imageUrls = conceptStepScripts
      .map(script => [
        script.maiPng ? getS3ImageURL(script.maiPng) : null,
        script.content ? getS3ImageURL(script.content) : null,
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

    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);
  });

  onCleanup(() => {
    cancelAutoProceed();
  });

  const currentScriptData = () => currentScript();

  // 콘텐츠 이미지 클래스 계산
  const contentImageClass = createMemo(() => {
    const script = currentScriptData();
    const scriptId = script?.id;
    const isMediumSize = scriptId === 15 || scriptId === 16 || scriptId === 21 || scriptId === 22;
    const isLargeSize = scriptId === 27 || scriptId === 28 || scriptId === 32 || scriptId === 33;
    const isTopPosition = scriptId === 9 || scriptId === 10 || scriptId === 11;
    
    let imageClass = styles.contentImage;
    if (isMediumSize) {
      imageClass = `${styles.contentImage} ${styles.mediumSize}`;
    } else if (isLargeSize) {
      imageClass = `${styles.contentImage} ${styles.largeSize}`;
    }
    
    if (isTopPosition) {
      imageClass = `${imageClass} ${styles.topPosition}`;
    }
    
    return imageClass;
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        class={`${pageContainerStyles.container} ${styles.container} ${isFadeOut() ? styles.fadeOut : styles.fadeIn} ${isFading() ? styles.fading : ''}`}
        style={{ "background-color": '#A9E0FF',}}
      >
        <div class={styles.contentWrapper}>
          <div class={styles.spanWrapper}><span>AI 비서 만들기</span></div>
          <Show when={currentScriptData()?.activity && !isFading()}>
            <h1 class={`${styles.activityTitle} ${styles.fadeIn}`}>
              {currentScriptData()?.activity}
            </h1>
          </Show>

          {/* 콘텐츠 이미지 */}
          <Show when={displayContentUrl() && !isFading()}>
            <img
              src={displayContentUrl()!}
              alt="Content"
              class={`${contentImageClass()} ${styles.fadeIn}`}
            />
          </Show>
          {/* <im g src={getS3ImageURL('4-2/eaRoles.png')} alt="" class={`${contentImageClass()} ${styles.fadeIn}`} /> */}

          {/* 캐릭터 이미지 */}
          <Show when={currentScriptData()?.maiPng && !isFading()}>
            <img
              src={displayCharacterUrl()}
              alt="MAI"
              class={`${styles.characterImage} ${currentScriptData()?.isMaiRight ? styles.characterRight : styles.characterLeft} ${styles.fadeIn}`}
            />
          </Show>

          {/* 대사 버블 */}
          <Show when={currentScriptData() && !isFading()}>
            <div class={`${styles.speechBubbleWrapper} ${styles.fadeIn}`}>
              <SpeechBubble 
                message={typingAnimation.displayedMessage()} 
                size={800}
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
                  return isComplete && currentScriptIndex() < conceptStepScripts.length - 1;
                }}
                canGoPrev={() => currentScriptIndex() > 0}
              />
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
            <button
              onClick={goToNextStep}
              class={`${styles.button} ${styles.buttonPrimary}`}
            >
              넘어가기
            </button>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default LearningAiAssistant;
