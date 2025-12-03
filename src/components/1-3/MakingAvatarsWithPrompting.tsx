import { Show, onMount, createSignal, createEffect, onCleanup } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './MakingAvatarsWithPrompting.module.css';
import { SpeechBubble } from '../SpeechBubble';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { makingAvatarsScripts } from '../../data/scripts/1-3';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';
import { LoadingSpinner } from '../LoadingSpinner';
import { getS3ImageURL } from '../../utils/loading';
import { ConfirmButton } from './ConfirmButton';
import MakeAvatar from './MakeAvatar';
import CharacterResult from './CharacterResult';
import { useCharacterImageStore } from '../../store/1/3/characterImageStore';

const MakingAvatarsWithPrompting = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isReady, setIsReady] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(-1);
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false);
  const [audioFinishedForId3, setAudioFinishedForId3] = createSignal(false);
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();
  
  // zustand 스토어에서 이미지 URL을 반응형으로 구독
  const [generatedImageUrl, setGeneratedImageUrl] = createSignal<string | null>(null);
  
  // 스토어의 변경사항을 구독하여 반응형으로 업데이트
  createEffect(() => {
    // 초기값 설정
    setGeneratedImageUrl(useCharacterImageStore.getState().generatedImageUrl);
    
    // 스토어 변경사항 구독
    const unsubscribe = useCharacterImageStore.subscribe((state) => {
      setGeneratedImageUrl(state.generatedImageUrl);
    });
    
    return unsubscribe;
  });
  
  // 인덱스를 id로 매핑: 0->1, 1->2, 2->3, 3->4(새 단계), 4->5(기존 id4)
  const getScriptById = (id: number) => {
    return makingAvatarsScripts.find(script => script.id === id) || null;
  };

  const currentScript = () => {
    const index = currentScriptIndex();
    if (index < 0) return null;
    
    // 총 5단계: index 0-2는 id 1-3, index 3은 id 4(새 단계), index 4는 id 5(기존 id4)
    if (index <= 2) {
      // index 0 -> id 1, index 1 -> id 2, index 2 -> id 3
      return getScriptById(index + 1);
    } else if (index === 3) {
      // index 3 -> id 4 (새로운 단계, 스크립트 없음 - 캐릭터 제작 화면)
      return { id: 4, script: '', voice: '' };
    } else if (index === 4) {
      // index 4 -> id 5 (기존 id 4였던 단계)
      return getScriptById(4);
    }
    
    // return getScriptById(5);
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
    let nextIndex = currentScriptIndex() + 1;
    
    // id 4 (index 3)는 스킵 - 바로 id 5 (index 4)로 이동
    if (nextIndex === 3) {
      // nextIndex = 5;
    }
    
    // 총 5단계 (index 0-4)
    if (nextIndex <= 4) {
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      setAudioFinishedForId3(false); // 다음 단계로 넘어갈 때 상태 초기화
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
    } else {
      // 마지막 단계 이후 처리
      // TODO: 다음 단계로 이동
      setCurrentScriptIndex(5)
    }
  };

  // MakeAvatar 컴포넌트를 표시하기 위한 함수
  const showMakeAvatar = () => {
    cancelAutoProceed();
    typingAnimation.resetSkipState();
    audioPlayback.stopAudio();
    setCurrentScriptIndex(3); // index 3은 id 4에 해당 (MakeAvatar 화면)
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
      const script = currentScript();
      // id가 3일 때는 스킵으로 다음으로 넘어가지 않고, 버튼 표시
      if (script?.id === 3) {
        audioPlayback.stopAudio();
        setAudioFinishedForId3(true); // 스킵 시에도 오디오가 끝난 것으로 처리
        return;
      }
      
      cancelAutoProceed();
      audioPlayback.stopAudio();
      if (currentScriptIndex() > 4) {
        // 마지막 단계라면 추후 처리
        return;
      } else {
        proceedToNext();
      }
    },
  });

  // 스크립트 변경 시 처리
  createEffect(() => {
    const script = currentScript();
    if (!script) return;
    const scriptIndex = currentScriptIndex();

    // id가 4일 때는 스크립트가 없으므로 오디오 재생 및 타이핑 애니메이션 스킵
    if (script.id === 4) {
      // MakeAvatar 화면 표시 - 자동 진행하지 않음
      return;
    }

    // 오디오 재생 로직
    if (!wasSkipped() || !audioPlayback.isPlaying()) {
      // 스크립트가 변경되면 id 3의 오디오 종료 상태 초기화
      if (script.id === 3) {
        setAudioFinishedForId3(false);
      }
      
      audioPlayback.playAudio(script.voice, {
        onEnded: () => {
          // id가 3일 때는 오디오 종료 상태를 true로 설정하고 자동 진행하지 않음
          if (script.id === 3) {
            setAudioFinishedForId3(true);
            return;
          }
          
          // id 5 (index 4)는 마지막 단계
          if (scriptIndex < 4) {
            if (wasSkipped()) {
              cancelAutoProceed();
              autoProceedTimeout = setTimeout(() => {
                proceedToNext();
              }, 500);
            } else {
              proceedToNext();
            }
          } else {
            // 마지막 스크립트의 음성이 끝나면 추후 처리
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

  onMount(() => {
    setIsReady(true);

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
    const id = script?.id;
    
    if (id === 1) {
      return (
        <div>
          <img style={{ width: '220px' }} src={getS3ImageURL('1-3/drawerMai.png')} alt="붓들고_있는_마이" />
        </div>
      );
    }
    
    if (id && id > 1 && id < 4) {
      return (
        <img 
          class={styles.characterImage}
          style={{ width: '330px' }} 
          src={getS3ImageURL('1-3/nakedMai.png')} 
          alt="헐벗은_마이" 
        />
      );
    }
    
    if (id === 4) {
      // id 4: 캐릭터 제작 화면에서는 이미지 표시 안함 (추후 컴포넌트로 교체)
      return null;
    }
    
    if (id === 5) {
      return (
        <img 
          class={styles.characterImage}
          style={{ width: '330px' }} 
          src={getS3ImageURL('1-3/nakedMai.png')} 
          alt="헐벗은_마이" 
        />
      );
    }
    
    return null;
  };

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div  
        class={pageContainerStyles.container}
        style={{
          position: 'relative',
          'background-color': '#A9C1FF',
          display: 'flex',
          'align-items': 'center',
          'flex-direction': 'column-reverse',
          padding: '1rem 2rem 1rem',
        }}>
        <Show when={currentScript()?.id !== 4}>
          <div class={styles.modal}>
            <h1 class={styles.title}>실습 : 캐릭터 만들어보기</h1>
            <div class={styles.content}>
              {currentScriptImage()}
              <SpeechBubble size={550}message={typingAnimation.displayedMessage()} />
              <Show when={currentScript()?.id === 2}>
                <img class={styles.sideCharacterImage} src={getS3ImageURL('1-3/smileRunningMai.png')} alt="웃으며_뛰는_마이" />
              </Show>
              <Show when={currentScript()?.id === 3}>
                <img class={styles.sideCharacterImage} src={getS3ImageURL('1-3/scisorMai.png')} alt="가위든_마이" />
              </Show>
              <Show when={currentScript()?.id === 3 && audioFinishedForId3()}>
                <div class={styles.confirmButtonContainer}>
                  <ConfirmButton 
                    onClick={() => {showMakeAvatar();}} 
                    text='만들어보자!'
                  />
                </div>
              </Show>
            </div>
          </div>
        </Show>
        <Show when={currentScript()?.id === 4 && !generatedImageUrl()}>
          <MakeAvatar />
        </Show>
        <Show when={generatedImageUrl()}>
          <CharacterResult 
            characterImageUrl={generatedImageUrl() || ''} 
            onRetry={() => {
              useCharacterImageStore.getState().clearGeneratedImageUrl();
            }} 
            onConfirm={() => {
              // 다음 단계(1/3/5)로 이동
              const worldId = params.worldId || '1';
              const classId = params.classId || '3';
              navigate(`/${worldId}/${classId}/5`);
            }} 
          />
        </Show>
      </div>
    </Show>
  );
};

export default MakingAvatarsWithPrompting;
