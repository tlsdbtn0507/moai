import { Show, onMount, createSignal, createEffect, createMemo, type JSX } from 'solid-js';
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
  const [currentChatImage, setCurrentChatImage] = createSignal<string | undefined>(undefined);
  const [characterImageUrl, setCharacterImageUrl] = createSignal<string | undefined>(undefined);
  const [answerText, setAnswerText] = createSignal(''); // 사용자 입력값
  const navigate = useNavigate();
  const params = useParams();

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

  // 스크립트 변화에 따라 이미지 반영
  createEffect(() => {
    const script = conversation.currentScript();
    if (!script) return;
    setCharacterImageUrl(getS3ImageURL(script.maiPic));
    setCurrentChatImage(script.chatPng ? getS3ImageURL(script.chatPng) : undefined);
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

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const answer = formData.get('answer') as string;
    localStorage.setItem('determineInfoPracticeAnswer', answer);

    // TODO: 답안 검증 로직 추가 예정
    // 현재는 한 글자 이상 입력 후 제출하면 다음 스크립트로 진행
    conversation.proceedToNext();
  };

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={`${pageContainerStyles.container} ${styles.mainContainer}`}>
        <div class={styles.contentCard}>
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
              <ConditionChecklist onCorrect={conversation.proceedToNext} />
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
            <Show when={conversation.currentScript()?.id >= 3 && conversation.currentScript()?.id <= 5}>
              <img src={checkListImg} alt="Check List" class={styles.checkListImage} />
            </Show>
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
              showNavigation={true}
              onNext={conversation.proceedToNext}
              onPrev={conversation.proceedToPrev}
              isComplete={() => {
                return conversation.isComplete();
              }}
              canGoNext={() => {
                const currentId = conversation.currentScript()?.id;
                // 스크립트 id가 5, 9, 10, 13일 때는 다음 버튼 숨김
                if (currentId === 5 || currentId === 9 || currentId === 10 || currentId === 13) return false;
                if (conversation.isLastScript()) return false;
                return conversation.isComplete();
              }}
              canGoPrev={() => conversation.currentScriptIndex() > 0}
            />
            <Show when={(conversation.currentScript()?.id === 9 || conversation.currentScript()?.id === 13) && conversation.isComplete()}>
              <div class={styles.confirmButtonWrapper}>
                <ConfirmButton 
                  onClick={() => {
                    const currentId = conversation.currentScript()?.id;
                    if (currentId === 9) {
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
