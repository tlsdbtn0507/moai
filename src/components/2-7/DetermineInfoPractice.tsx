import { Show, onMount, onCleanup, createSignal, createEffect, createMemo, type JSX } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import { practiceScripts } from '../../data/scripts/2-7';
import { useMoaiConversation } from '../../utils/hooks/useMoaiConversation';
import { ConditionChecklist } from './ConditionChecklist';
import { ConfirmButton } from '../1-3/ConfirmButton';

import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './DetermineInfoPractice.module.css';

const DetermineInfoPractice = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isAutoPlay, setIsAutoPlay] = createSignal(false); // 자동 재생 모드
  const [currentChatImage, setCurrentChatImage] = createSignal<string | undefined>(undefined);
  const [characterImageUrl, setCharacterImageUrl] = createSignal<string | undefined>(undefined);
  const [answerText, setAnswerText] = createSignal(''); // 사용자 입력값
  const navigate = useNavigate();
  const params = useParams();
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null; // 자동 진행 타이머

  const checkListImg = getS3ImageURL('1-3/checkList.png');

  // voiceUrl -> voice 필드로 변환하여 훅에 전달 (전체 스크립트 사용)
  const conversationScripts = createMemo(() =>
    practiceScripts.map((s) => ({
      ...s,
      voice: s.voiceUrl,
    }))
  );

  const conversation = useMoaiConversation(
    () => conversationScripts() as any,
    () => {
      // 모든 스크립트 완료 시 다음 단계로 이동
      const worldId = params.worldId || '2';
      const classId = params.classId || '7';
      const nextStepId = '4';
      navigate(`/${worldId}/${classId}/${nextStepId}`);
    },
    { typingSpeed: 150 }
  );

  // 스크립트 변화에 따라 이미지 반영 및 자동 진행 타이머 관리
  let previousScriptIdForImage: number | undefined = undefined;
  createEffect(() => {
    const script = conversation.currentScript();
    if (!script) return;
    
    const currentScriptId = script.id;
    const scriptChanged = previousScriptIdForImage !== undefined && previousScriptIdForImage !== currentScriptId;
    previousScriptIdForImage = currentScriptId;
    
    setCharacterImageUrl(getS3ImageURL(script.maiPic));
    setCurrentChatImage(script.chatPng ? getS3ImageURL(script.chatPng) : undefined);
    
    // 스크립트가 변경되면 자동 진행 타이머 취소 (자동재생 모드일 때만)
    if (isAutoPlay() && scriptChanged) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
    }
    
    // 스크립트 id가 2, 5, 9, 10, 11, 13일 때는 자동 진행을 즉시 멈춤 (자동재생 모드일 때만)
    if (isAutoPlay() && (script.id === 2 || script.id === 5 || script.id === 9 || script.id === 10 || script.id === 11 || script.id === 13)) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
    }
  });

  // SpeechBubble 크기 결정
  const speechBubbleSize = createMemo(() => {
    const script = conversation.currentScript();
    return script?.isSpeechBubbleBig ? 600 : 500;
  });

  // 캐릭터 이미지 래퍼 위치 동적 스타일
  const characterWrapperStyle = createMemo<JSX.CSSProperties>(() => {
    const script = conversation.currentScript();
    if (!script) return {};
    if (script.isSpeechBubbleBig) {
      return { position: 'absolute', bottom: '13rem', left: '30%', 'z-index': 1 };
    }
    return { position: 'absolute', bottom: '0', left: '-6%', 'z-index': 1 };
  });

  // 캐릭터 이미지 크기 동적 스타일
  const characterImageStyle = createMemo<JSX.CSSProperties>(() => {
    const script = conversation.currentScript();
    if (!script) return {};
    if (script.isSpeechBubbleBig) {
      return { width: '330px', height: 'auto' };
    }
    return { width: '150px', height: 'auto' };
  });

  // speechArea 위치 동적 스타일
  const speechAreaStyle = createMemo<JSX.CSSProperties>(() => {
    const script = conversation.currentScript();
    if (!script) return {};
    if (!script.isSpeechBubbleBig) {
      return { left: '3rem' };
    }
    return {};
  });

  const activateAudioContext = () => {
    if (audioContextActivated()) return;
    
    const emptyAudio = new Audio();
    emptyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    emptyAudio.volume = 0.01;
    emptyAudio.play().then(() => {
      emptyAudio.pause();
      setAudioContextActivated(true);
      setTimeout(() => {
        // 오디오 컨텍스트 활성화 후 첫 스크립트 시작
        conversation.proceedToPrev(); // no-op 유지
      }, 100);
    }).catch(() => {
      setAudioContextActivated(true);
      setTimeout(() => {
        conversation.proceedToPrev(); // no-op 유지
      }, 100);
    });
  };

  onMount(async () => {
    const imageUrls = practiceScripts
      .map(script => [
        script.maiPic ? getS3ImageURL(script.maiPic) : null,
        script.chatPng ? getS3ImageURL(script.chatPng) : null,
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
    // 자동 진행 타이머 정리
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const answer = formData.get('answer') as string;
    localStorage.setItem('determineInfoPracticeAnswer', answer);

    // TODO: 답안 검증 로직 추가 예정
    // 현재는 한 글자 이상 입력 후 제출하면 다음 스크립트로 진행
    conversation.proceedToNext();
  };

  // 자동 재생 모드: 스크립트 1, 3-7 자동 진행, id 2, 8, 9, 13에서 사용자 입력 대기
  let previousScriptId: number | undefined = undefined;
  createEffect(() => {
    if (!isAutoPlay()) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      previousScriptId = undefined;
      return;
    }

    const script = conversation.currentScript();
    if (!script) return;

    // 스크립트가 변경되었는지 확인
    const currentScriptId = script.id;
    const scriptChanged = previousScriptId !== undefined && previousScriptId !== currentScriptId;
    previousScriptId = currentScriptId;

    // 스크립트가 변경되면 기존 타이머 취소
    if (scriptChanged && autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }

    // id가 2, 5, 9, 10, 11, 13일 때는 자동 진행을 멈추고 사용자 입력을 기다림
    // - id 2: ConfirmButton 클릭 대기
    // - id 5: 폼 제출 대기
    // - id 9: ConfirmButton 클릭 대기
    // - id 10, 11: ConditionChecklist 클릭 대기
    // - id 13: ConfirmButton 클릭 대기
    // 이 조건을 먼저 확인하여 타이머를 즉시 취소
    if (currentScriptId === 2 || currentScriptId === 5 || currentScriptId === 9 || currentScriptId === 10 || currentScriptId === 13) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

    // 마지막 스크립트에서는 자동으로 다음 차시로 넘기지 않음
    if (conversation.isLastScript()) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

    // 아직 대사가 완전히 끝나지 않았으면 대기
    if (!conversation.isComplete()) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

    // 스크립트 id가 12보다 크면 자동 진행하지 않음 (단, 13은 위에서 처리됨)
    // 스크립트 12는 자동으로 진행되어야 함
    if (currentScriptId > 12 && currentScriptId !== 13) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

    // 기본 딜레이 400ms
    const delayMs = 400;

    // 이미 타이머가 설정되어 있으면 중복 설정 방지
    if (autoProceedTimeout) return;
    
    autoProceedTimeout = setTimeout(() => {
      conversation.proceedToNext();
      autoProceedTimeout = null;
    }, delayMs);
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={`${pageContainerStyles.container} ${styles.mainContainer}`}>
        <div class={styles.contentCard}>
          {/* 자동 재생 토글 버튼 */}
          <div
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              'z-index': 5,
            }}
          >
            <button
              onClick={() => setIsAutoPlay((prev) => !prev)}
              style={{
                padding: '0.4rem 0.8rem',
                'border-radius': '1rem',
                border: '1px solid #fff',
                background: isAutoPlay() ? '#4caf50' : 'rgba(0,0,0,0.4)',
                color: '#fff',
                'font-size': '0.8rem',
                cursor: 'pointer',
                'font-family': 'CookieRun',
              }}
            >
              자동재생: {isAutoPlay() ? 'ON' : 'OFF'}
            </button>
          </div>

          <p class={styles.titleBadge}>실습: AI에게 정확하게 질문하기</p>

          <Show when={currentChatImage()}>
            <div class={styles.chatImageContainer}>
              <img
                src={currentChatImage()}
                alt="Chat Interface"
                class={styles.chatImage}
              />
            </div>
            <Show when={conversation.currentScript()?.id === 10 || conversation.currentScript()?.id === 11}>
              <ConditionChecklist 
                scriptId={conversation.currentScript()?.id}
                onCorrect={() => {
                  // 자동 진행 타이머가 있으면 취소
                  if (autoProceedTimeout) {
                    clearTimeout(autoProceedTimeout);
                    autoProceedTimeout = null;
                  }
                  // 다음 스크립트로 진행
                  const currentId = conversation.currentScript()?.id;
                  const currentIndex = conversation.currentScriptIndex();
                  const scriptsArray = conversationScripts();
                  console.log('ConditionChecklist onCorrect called, current script id:', currentId, 'index:', currentIndex, 'total scripts:', scriptsArray.length);
                  
                  // proceedToNext 호출
                  conversation.proceedToNext();
                  
                  // 다음 렌더링 사이클에서 확인
                  setTimeout(() => {
                    const newId = conversation.currentScript()?.id;
                    const newIndex = conversation.currentScriptIndex();
                    console.log('After proceedToNext, new script id:', newId, 'index:', newIndex);
                    
                    // 스크립트가 변경되지 않았다면 강제로 다시 시도
                    if (newId === currentId && newIndex === currentIndex) {
                      console.log('Script did not change, forcing proceedToNext again');
                      conversation.proceedToNext();
                      setTimeout(() => {
                        const finalId = conversation.currentScript()?.id;
                        const finalIndex = conversation.currentScriptIndex();
                        console.log('After forced proceedToNext, script id:', finalId, 'index:', finalIndex);
                      }, 100);
                    }
                  }, 100);
                }} 
              />
            </Show>
            <Show when={conversation.currentScript()?.id >= 3 && conversation.currentScript()?.id <= 5}>
              <img src={checkListImg} alt="Check List" class={styles.checkListImage} />
            </Show>
          </Show>
          <Show when={conversation.currentScript()?.id === 5 && conversation.isComplete()}>
            <form onSubmit={handleSubmit} class={styles.form}>
              <input
                type="text"
                class={styles.formInput}
                name="answer"
                placeholder="체크리스트의 항목을 반영하여 수정해보세요"
                value={answerText()}
                onInput={(e) => setAnswerText(e.currentTarget.value)}
              />
              <button
                type="submit"
                class={styles.submitButton}
                disabled={answerText().trim().length === 0}
              >
                입력
              </button>
            </form>
          </Show>

          <div class={styles.speechArea} style={speechAreaStyle()}>
            <div class={styles.characterImageWrapper} style={characterWrapperStyle()}>
              <img
                src={characterImageUrl()}
                alt="MAI"
                class={styles.characterImage}
                style={characterImageStyle()}
              />
            </div>
            <SpeechBubble 
              message={conversation.displayedMessage()}
              type='simple'
              size={speechBubbleSize()}
              showNavigation={!isAutoPlay()}
              onNext={isAutoPlay() ? undefined : conversation.proceedToNext}
              onPrev={isAutoPlay() ? undefined : conversation.proceedToPrev}
              isComplete={() => {
                return conversation.isComplete();
              }}
              canGoNext={() => {
                if (isAutoPlay()) return false;
                const currentId = conversation.currentScript()?.id;
                // 스크립트 id가 5, 9, 10, 13일 때는 다음 버튼 숨김
                if (currentId === 2 || currentId === 5 || currentId === 9 || currentId === 10 || currentId === 13) return false;
                if (conversation.isLastScript()) return false;
                return conversation.isComplete();
              }}
              canGoPrev={() => {
                if (isAutoPlay()) return false;
                return conversation.currentScriptIndex() > 0;
              }}
            />
            <Show when={(conversation.currentScript()?.id === 2 || conversation.currentScript()?.id === 9 || conversation.currentScript()?.id === 13) && conversation.isComplete()}>
              <div class={styles.confirmButtonWrapper}>
                <ConfirmButton 
                  onClick={() => {
                    const currentId = conversation.currentScript()?.id;
                    if (currentId === 2 || currentId === 9) {
                      conversation.proceedToNext();
                    } else if (currentId === 13) {
                      navigate('/2/7/4');
                    }
                  }}
                  text="알겠어!"
                />
              </div>
            </Show>
          </div>
          {/* <Show when={con  */}
        </div>
      </div>
    </Show>
  );
};

export default DetermineInfoPractice;
