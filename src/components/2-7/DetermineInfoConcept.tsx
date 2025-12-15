import { Show, onMount, createSignal, createEffect, onCleanup, createMemo, type JSX } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './DetermineInfoConcept.module.css';
import { conceptScripts } from '../../data/scripts/2-7';
import { useMoaiConversation } from '../../utils/hooks/useMoaiConversation';

const DetermineInfoConcept = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [currentTitle, setCurrentTitle] = createSignal<string | undefined>(conceptScripts[0]?.titleSection?.title);
  const [currentConcept, setCurrentConcept] = createSignal(conceptScripts[0]?.titleSection?.description || '');
  const [currentContent, setCurrentContent] = createSignal<string | undefined>(
    conceptScripts[0]?.contentPic ? getS3ImageURL(conceptScripts[0].contentPic!) : undefined
  );
  const [characterImageUrl, setCharacterImageUrl] = createSignal(
    getS3ImageURL(conceptScripts[0]?.maiPic || '2-7/mai.png')
  );
  const navigate = useNavigate();
  const params = useParams();

  // voiceUrl -> voice 필드로 변환하여 훅에 전달
  const conversationScripts = createMemo(() =>
    conceptScripts.map((s) => ({
      ...s,
      voice: s.voiceUrl,
    }))
  );

  const conversation = useMoaiConversation(
    () => conversationScripts() as any,
    () => {
      const worldId = params.worldId || '2';
      const classId = params.classId || '7';
      const nextStepId = '3';
      navigate(`/${worldId}/${classId}/${nextStepId}`);
    },
    { typingSpeed: 150 }
  );

  // 스크립트 변화에 따라 제목/개념/이미지 반영
  createEffect(() => {
    const script = conversation.currentScript();
    if (!script) return;
    setCurrentTitle(script.titleSection?.title);
    setCurrentConcept(script.titleSection?.description || '');
    setCharacterImageUrl(getS3ImageURL(script.maiPic));
    setCurrentContent(script.contentPic ? getS3ImageURL(script.contentPic) : undefined);
  });

  // 컨텐츠 이미지 위치 동적 스타일
  const contentPositionStyle = createMemo<JSX.CSSProperties>(() => {
    const script = conversation.currentScript();
    if (!script || !script.contentPic) return {};
    if (script.id === 4) {
      return { position: 'absolute', top: '13rem' };
    }
    if (script.id === 5) {
      return { position: 'absolute', top: '13rem', left: '14rem' };
    }
    if (script.id >= 6 && script.id <= 8) {
      return { position: 'absolute', top: '12rem', left: '14rem' };
    }
    if (script.id >= 22 && script.id <= 25) {
      return { position: 'absolute', top: '8rem' };
    }
    if (script.id === 27 || script.id === 28) {
      return { position: 'absolute', top: '10rem' };
    }
    return {};
  });

  // 컨텐츠 이미지 크기 동적 스타일
  const contentImageStyle = createMemo<JSX.CSSProperties>(() => {
    const script = conversation.currentScript();
    if (!script) return {};
    if (script.id >= 22 && script.id <= 25) {
      return { width: '700px', maxWidth: '100%', height: 'auto' };
    }
    if (script.id === 27 || script.id === 28) {
      return { width: '750px', maxWidth: '100%', height: 'auto' };
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
    const imageUrls = conceptScripts
      .map(script => [
        script.maiPic ? getS3ImageURL(script.maiPic) : null,
        script.contentPic ? getS3ImageURL(script.contentPic) : null,
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
    // 별도 타이머 없음
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={`${pageContainerStyles.container} ${styles.mainContainer}`}>
        <div class={styles.contentCard}>
          <p class={styles.titleBadge}>AI 정보 출처 판단하기</p>

          <Show when={currentConcept()}>
            <div class={styles.conceptBox}>
              <span class={styles.conceptTitle}>개념</span>
              <span class={styles.conceptText}>{currentConcept()}</span>
            </div>
          </Show>

          <Show when={currentContent()}>
            <div class={styles.contentBox} style={contentPositionStyle()}>
              <img
                src={currentContent()}
                alt="Content"
                class={styles.contentImage}
                style={contentImageStyle()}
              />
            </div>
          </Show>

          <div class={styles.speechArea}>
            <div class={styles.characterImageWrapper}>
              <img src={characterImageUrl()} alt="MAI" class={styles.characterImage} />
            </div>
            <SpeechBubble 
              message={conversation.displayedMessage()} 
              size={600}
              showNavigation={true}
              onNext={conversation.proceedToNext}
              onPrev={conversation.proceedToPrev}
              scriptHistory={conversationScripts().map((s) => ({ id: s.id, script: s.script }))}
              currentScriptIndex={conversation.currentScriptIndex()}
              onModalStateChange={setIsModalOpen}
              isComplete={() => {
                return conversation.isComplete();
              }}
              canGoNext={() => {
                if (conversation.isLastScript()) return false;
                return conversation.isComplete();
              }}
              canGoPrev={() => conversation.currentScriptIndex() > 0}
            />
          </div>
          <Show when={conversation.isLastScript() && conversation.isComplete() && !isModalOpen()}>
            <div class={styles.buttonGroup}>
              <button
                onClick={() => navigate('/2/7/3')}
                class={`${styles.primaryButton} ${styles.goNextButton}`}
              >
                넘어가기
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default DetermineInfoConcept;
