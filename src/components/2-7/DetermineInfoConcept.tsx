import { Show, onMount, createSignal, createEffect, onCleanup, createMemo, type JSX } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import { conceptScripts } from '../../data/scripts/2-7';
import { useMoaiConversation } from '../../utils/hooks/useMoaiConversation';

import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './DetermineInfoConcept.module.css';

const DetermineInfoConcept = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isAutoPlay, setIsAutoPlay] = createSignal(false); // 자동 재생 모드
  const [currentTitle, setCurrentTitle] = createSignal<string | undefined>(conceptScripts[0]?.titleSection?.title);
  const [currentConcept, setCurrentConcept] = createSignal(conceptScripts[0]?.titleSection?.description || '');
  const [currentContent, setCurrentContent] = createSignal<string | undefined>(
    conceptScripts[0]?.contentPic ? getS3ImageURL(conceptScripts[0].contentPic!) : undefined
  );
  const [characterImageUrl, setCharacterImageUrl] = createSignal(
    getS3ImageURL(conceptScripts[0]?.maiPic || '2-7/mai.png')
  );
  let conceptDescriptionRef: HTMLSpanElement | undefined; // concept description ref
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null; // 자동 진행 타이머
  const navigate = useNavigate();
  const params = useParams();

  // HTML 태그 제거 유틸 (타이핑용 순수 텍스트)
  const stripHtmlTags = (text: string): string =>
    text.replace(/<\/?[^>]+(>|$)/g, '');

  // voiceUrl -> voice 필드로 변환하고, 타이핑용으로는 HTML 태그 제거한 버전 사용
  // 원본 script는 보존하여 완료 후 HTML 렌더링에 사용
  const conversationScripts = createMemo(() =>
    conceptScripts.map((s) => ({
      ...s,
      voice: s.voiceUrl,
      originalScript: s.script, // 원본 스크립트 보존
      script: stripHtmlTags(s.script), // 타이핑용으로는 HTML 태그 제거
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

  // concept의 HTML 렌더링 처리
  createEffect(() => {
    const concept = currentConcept();
    if (conceptDescriptionRef) {
      conceptDescriptionRef.innerHTML = concept || '';
    }
  });

  // 현재 대사를 HTML 포함 버전으로 보여줄지 결정 (타이핑 완료 시)
  const displayMessage = () => {
    const script = conversation.currentScript();
    if (!script) return conversation.displayedMessage();

    // originalScript가 있으면 원본 사용, 없으면 현재 script 사용 (하위 호환성)
    const originalScript = (script as any).originalScript || script.script;
    const plainScript = script.script; // 이미 HTML 태그가 제거된 버전
    
    const isTypingComplete =
      conversation.displayedMessage().length === plainScript.length ||
      conversation.isComplete();
    const isAudioComplete = !conversation.isAudioPlaying();

    const isComplete = isTypingComplete && isAudioComplete;

    // 완료 전에는 순수 텍스트(타이핑), 완료 후에는 HTML 포함 원본 스크립트
    return isComplete ? originalScript : conversation.displayedMessage();
  };

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
    // 자동 진행 타이머 정리
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  });

  // 자동 재생 모드: 마지막 스크립트 전까지 오디오+타이핑 완료 시 자동으로 다음 스크립트로 진행
  createEffect(() => {
    if (!isAutoPlay()) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

    const script = conversation.currentScript();
    if (!script) return;

    // 마지막 스크립트에서는 자동으로 다음 차시로 넘기지 않고 "다음으로" 버튼 사용
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

    // 기본 딜레이 400ms
    const delayMs = 400;

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

          <p class={styles.titleBadge}>AI 정보 출처 판단하기</p>

          <Show when={currentConcept()}>
            <div class={styles.conceptBox}>
              <span class={styles.conceptTitle}>{currentTitle()}</span>
              <span 
                class={styles.conceptText}
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
              message={displayMessage()} 
              size={600}
              type="simple"
              showNavigation={!isAutoPlay()}
              onNext={isAutoPlay() ? undefined : conversation.proceedToNext}
              onPrev={isAutoPlay() ? undefined : conversation.proceedToPrev}
              scriptHistory={(() => {
                const currentIndex = conversation.currentScriptIndex();
                return conversationScripts().slice(0, currentIndex + 1).map(s => ({ 
                  id: s.id, 
                  script: (s as any).originalScript || s.script // 원본 스크립트 사용 (HTML 포함)
                }));
              })()}
              currentScriptIndex={conversation.currentScriptIndex()}
              onModalStateChange={setIsModalOpen}
              isComplete={() => {
                return conversation.isComplete();
              }}
              canGoNext={() => {
                if (isAutoPlay()) return false;
                if (conversation.isLastScript()) return false;
                return conversation.isComplete();
              }}
              canGoPrev={() => {
                if (isAutoPlay()) return false;
                return conversation.currentScriptIndex() > 0;
              }}
            />
          </div>
          <Show when={conversation.isLastScript() && conversation.isComplete() && !isModalOpen()}>
            <div class={styles.buttonGroup}>
              <button
                onClick={() => navigate('/2/7/3')}
                class={`${styles.primaryButton} ${styles.goNextButton}`}
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

export default DetermineInfoConcept;
