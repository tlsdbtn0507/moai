import { Show, onMount, createSignal, createEffect, onCleanup } from 'solid-js';
import { getS3ImageURL, getS3TTSURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './ImportanceOfPrompting.module.css';
import { importanceOfPromptingScripts, ScriptInterface } from '../../data/scripts/1-3';

const ImportanceOfPrompting = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [displayedMessage, setDisplayedMessage] = createSignal('');
  const [currentTitle, setCurrentTitle] = createSignal<string | undefined>(undefined);
  const [currentConcept, setCurrentConcept] = createSignal(importanceOfPromptingScripts[0]?.concept || '');
  const [characterImageUrl, setCharacterImageUrl] = createSignal(getS3ImageURL('1-3/pointingMai.png'));
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  
  let typingInterval: ReturnType<typeof setInterval> | null = null;
  let currentAudio: HTMLAudioElement | null = null;

  // 현재 스크립트 가져오기
  const currentScript = () => importanceOfPromptingScripts[currentScriptIndex()];

  // 타이핑 애니메이션 함수
  const startTyping = (message: string) => {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    
    let typingIndex = 0;
    setDisplayedMessage('');
    
    typingInterval = setInterval(() => {
      if (typingIndex < message.length) {
        setDisplayedMessage(message.slice(0, typingIndex + 1));
        typingIndex++;
      } else {
        if (typingInterval) {
          clearInterval(typingInterval);
          typingInterval = null;
        }
      }
    }, 150);
  };

  // 오디오 재생 함수
  const playAudio = (script: ScriptInterface, onEnded?: () => void) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audioFile = getS3TTSURL(script.voice);
    currentAudio = new Audio(audioFile);
    
    currentAudio.addEventListener('loadeddata', () => {
      currentAudio?.play().catch((error) => {
        console.error('오디오 재생 실패:', error);
      });
    });

    currentAudio.addEventListener('ended', () => {
      if (onEnded) {
        onEnded();
      }
    });

    currentAudio.addEventListener('error', (e) => {
      console.error('오디오 로드 실패:', e);
    });

    currentAudio.load();
  };

  // 다음 스크립트로 진행
  const proceedToNext = () => {
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < importanceOfPromptingScripts.length) {
      setCurrentScriptIndex(nextIndex);
    }
  };

  // 클릭 이벤트 핸들러 (다음 스크립트로 진행) - 선택적으로 사용 가능
  const handleClick = () => {
    if (currentScriptIndex() < importanceOfPromptingScripts.length - 1) {
      proceedToNext();
    }
  };

  // 스크립트 변경 시 처리
  createEffect(() => {
    const script = currentScript();
    if (!script) return;

    // title 업데이트
    setCurrentTitle(script.title);
    
    // concept 업데이트
    setCurrentConcept(script.concept);
    
    // 캐릭터 이미지 업데이트
    setCharacterImageUrl(getS3ImageURL(script.maiPng));

    // 오디오 재생 및 타이핑 애니메이션
    playAudio(script, () => {
      // 오디오 재생 완료 후 자동으로 다음 스크립트로 진행 (마지막 스크립트가 아닐 경우)
      if (currentScriptIndex() < importanceOfPromptingScripts.length - 1) {
        // 약간의 딜레이 후 자동으로 다음 스크립트로 진행
        setTimeout(() => {
          proceedToNext();
        }, 500); // 0.5초 딜레이
      }
    });

    // 오디오 시작 후 0.5초 뒤에 타이핑 애니메이션 시작
    setTimeout(() => {
      startTyping(script.script);
    }, 500);
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

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    };
  });

  onCleanup(() => {
    if (typingInterval) {
      clearInterval(typingInterval);
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
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
              <SpeechBubble message={displayedMessage()} size={600} />
            </div>
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
