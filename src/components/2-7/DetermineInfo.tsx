import { Show, onMount, createSignal, createEffect, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './DetermineInfo.module.css';
import { introScripts } from '../../data/scripts/2-7';
import { useMoaiConversation } from '../../utils/hooks/useMoaiConversation';
import { Dynamic } from 'solid-js/web';
import CombinationModal from './CombinationModal';

const DetermineInfo = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [isFading, setIsFading] = createSignal(false);
  const [isFadeOut, setIsFadeOut] = createSignal(false);
  const [displayBackgroundUrl, setDisplayBackgroundUrl] = createSignal(getS3ImageURL('2-7/desk.png'));
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [showContentImage, setShowContentImage] = createSignal(false);
  const [showIntermediateComponent, setShowIntermediateComponent] = createSignal(false);
  const [isAutoPlay, setIsAutoPlay] = createSignal(false);
  const navigate = useNavigate();
  const params = useParams();

  // 스크립트를 useMoaiConversation 형식으로 변환 (voiceUrl -> voice)
  const convertedScripts = createMemo(() => 
    introScripts.map(script => ({
      ...script,
      voice: script.voiceUrl,
    }))
  );

  // Moai 대화 기능 사용
  const conversation = useMoaiConversation(
    convertedScripts,
    () => {
      // 모든 스크립트 완료 시 다음 단계로 이동
      const worldId = params.worldId || '2';
      const classId = params.classId || '7';
      const nextStepId = '2';
      navigate(`/${worldId}/${classId}/${nextStepId}`);
    },
    { typingSpeed: 150 }
  );

  // 배경 이미지 변경 시 fade 애니메이션 처리
  createEffect(() => {
    const script = conversation.currentScript();
    if (!script) return;

    const newBgUrl = script.bgPng ? getS3ImageURL(script.bgPng) : getS3ImageURL('2-7/desk.png');
    const currentBgUrl = displayBackgroundUrl();
    
    // id가 1일 때 content 이미지 표시 지연 처리
    if (script.id === 1 && typeof script.content === 'string' && script.content) {
      setShowContentImage(false);
      setTimeout(() => {
        setShowContentImage(true);
      }, 1500);
    } else {
      setShowContentImage(true);
    }
    
    if (newBgUrl !== currentBgUrl && currentBgUrl) {
      setIsFading(true);
      setIsFadeOut(true);
      
      setTimeout(() => {
        setDisplayBackgroundUrl(newBgUrl);
        setIsFadeOut(false);
      }, 600);
      
      setTimeout(() => {
        setIsFading(false);
      }, 1200);
    } else if (!currentBgUrl) {
      setDisplayBackgroundUrl(newBgUrl);
    }
  });

  onMount(async () => {
    // 모든 이미지 프리로드
    const imageUrls = introScripts
      .map(script => [
        script.bgPng ? getS3ImageURL(script.bgPng) : null,
        typeof script.content === 'string' && script.content ? getS3ImageURL(script.content) : null,
      ])
      .flat()
      .filter(Boolean) as string[];
      
    try {
      await preloadImages(imageUrls);
      setIsReady(true);
    } catch (error) {
      setIsReady(true);
    }
  });

  const currentScript = () => conversation.currentScript();

  // id가 5인 스크립트 완료 후 중간 컴포넌트 표시 여부
  const shouldShowIntermediate = createMemo(() => {
    const script = currentScript();
    return script?.id === 5 && conversation.isComplete() && !showIntermediateComponent();
  });

  // 다음 버튼 클릭 핸들러 (id가 5일 때 중간 컴포넌트 표시)
  const handleNext = () => {
    const script = currentScript();
    if (script?.id === 5 && conversation.isComplete()) {
      setShowIntermediateComponent(true);
    } else {
      conversation.proceedToNext();
    }
  };

  // 중간 컴포넌트에서 다음으로 진행
  const handleIntermediateNext = () => {
    setShowIntermediateComponent(false);
    conversation.proceedToNext();
  };

  // 완료 여부 확인
  const shouldShowNextButton = createMemo(() => {
    if (!conversation.isComplete()) return false;
    if (shouldShowIntermediate()) return true; // id가 5일 때는 중간 컴포넌트로
    return !conversation.isLastScript();
  });

  const shouldShowPrevButton = createMemo(() => {
    if (!conversation.isComplete()) return false;
    return conversation.currentScriptIndex() > 0;
  });

  // 자동 재생 모드: 오디오+타이핑 완료 후,
  // - 이미지가 있는 스크립트는 이미지가 표시된 뒤 3초 후 자동 진행
  // - 그 외 스크립트는 짧은 딜레이 후 자동 진행
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  createEffect(() => {
    if (!isAutoPlay()) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

    const script = currentScript();
    if (!script) return;

    // id 5인 경우: 자동재생일 때도 CombinationModal을 띄우고, 자동으로 다음 스크립트로 넘기지 않음
    if (script.id === 5) {
      if (!showIntermediateComponent() && conversation.isComplete()) {
        setShowIntermediateComponent(true);
      }
      // 모달이 떠 있는 동안에는 자동 진행 금지
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

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
    let delayMs = 400;

    // id가 8인 경우에만:
    // - showContentImage()가 true가 된 뒤
    // - 3초 동안 이미지를 보여주고 나서 다음 스크립트로 진행
    if (script.id === 8) {
      if (!showContentImage()) {
        // 아직 이미지가 안 뜬 상태라면 기다린다
        if (autoProceedTimeout) {
          clearTimeout(autoProceedTimeout);
          autoProceedTimeout = null;
        }
        return;
      }
      delayMs = 3000;
    }

    if (autoProceedTimeout) return;
    autoProceedTimeout = setTimeout(() => {
      conversation.proceedToNext();
      autoProceedTimeout = null;
    }, delayMs);
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        class={`${pageContainerStyles.container} ${styles.container} ${isFadeOut() ? styles.fadeOut : styles.fadeIn} ${isFading() ? styles.fading : ''}`}
        style={{
          'background-image': `url(${displayBackgroundUrl()})`,
        }}
      >
        <div class={styles.contentWrapper}>
          {/* 자동 재생 토글 버튼 */}
          <div
            style={{
              position: 'absolute',
              top: currentScript()?.id === 2 || currentScript()?.id === 3 ? '-21rem' : '-2rem',
              left: '2rem',
              'z-index': 5,
            }}
          >
            <button
              onClick={() => setIsAutoPlay(prev => !prev)}
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
          {/* 콘텐츠 렌더링 */}
          <Show when={currentScript()?.content && !isFading()}>
            <Show
              when={typeof currentScript()?.content === 'string' && currentScript()?.content}
              fallback={
                <div class={`${styles.contentComponent} ${styles.fadeIn}`}>
                  <Dynamic component={currentScript()?.content as any} />
                </div>
              }
            >
              <div 
                style={{height: '360px'}}
                class={currentScript()?.id === 1 ? styles.contentImageWrapperId1 : ''}
              >
                <Show when={showContentImage()}>
                  <img
                    src={
                      currentScript()?.id === 8 && conversation.isComplete()
                        ? getS3ImageURL('2-7/comparingNews.png')
                        : getS3ImageURL(currentScript()!.content as string)
                    }
                    alt="Content"
                    class={`${styles.contentImage} ${currentScript()?.id === 1 ? styles.slideInFromRight : styles.fadeIn}`}
                  />
                </Show>
              </div>
            </Show>
          </Show>

          {/* SpeechBubble이 true일 때 */}
          <Show when={currentScript()?.isSpeechBubble && !isFading() && !showIntermediateComponent()}>
            <div class={`${styles.speechBubbleWrapper} ${styles.fadeIn}`}>
              <SpeechBubble 
                message={conversation.displayedMessage()} 
                size={800}
                showNavigation={!isAutoPlay()}
                onNext={isAutoPlay() ? undefined : handleNext}
                onPrev={isAutoPlay() ? undefined : conversation.proceedToPrev}
                scriptHistory={(() => {
                  const currentIndex = conversation.currentScriptIndex();
                  return introScripts.slice(0, currentIndex + 1).map(s => ({ id: s.id, script: s.script }));
                })()}
                currentScriptIndex={conversation.currentScriptIndex()}
                onModalStateChange={setIsModalOpen}
                isComplete={conversation.isComplete}
                canGoNext={() => {
                  if (isAutoPlay()) return false;
                  if (!conversation.isComplete()) return false;
                  if (shouldShowIntermediate()) return true;
                  return !conversation.isLastScript();
                }}
                canGoPrev={() => !isAutoPlay() && conversation.currentScriptIndex() > 0}
              />
            </div>
          </Show>

          {/* SpeechBubble이 false일 때 - 투명도가 있는 회색 배경에 검은 글자 */}
          <Show when={!currentScript()?.isSpeechBubble && currentScript()?.script && !isFading()}>
            <div class={`${styles.subtitleContainer} ${styles.fadeIn}`}>
              <div class={styles.subtitleText}>
                {conversation.displayedMessage()}
              </div>
              <Show when={!isAutoPlay() && shouldShowPrevButton()}>
                <button
                  onClick={conversation.proceedToPrev}
                  class={styles.navButtonPrev}
                >
                  이전
                </button>
              </Show>
              <Show when={!isAutoPlay() && shouldShowNextButton()}>
                <button
                  onClick={handleNext}
                  class={styles.navButtonNext}
                >
                  다음
                </button>
              </Show>
            </div>
          </Show>

          {/* id가 5인 스크립트 완료 후 중간 컴포넌트 */}
          <Show when={showIntermediateComponent()}>
            <CombinationModal 
              onNext={handleIntermediateNext} 
              onClose={() => {
                // 모달을 명시적으로 닫기 (자동재생 모드에서도 확실히 닫히도록)
                setShowIntermediateComponent(false);
              }} 
            />
          </Show>
        </div>

        {/* 마지막 스크립트 완료 시 다음으로 버튼 */}
        <Show when={conversation.isLastScript() && conversation.isComplete() && !isModalOpen()}>
          <div class={styles.buttonContainer}>
            <button
              onClick={() => {
                const worldId = params.worldId || '2';
                const classId = params.classId || '7';
                const nextStepId = '2';
                navigate(`/${worldId}/${classId}/${nextStepId}`);
              }}
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

export default DetermineInfo;
