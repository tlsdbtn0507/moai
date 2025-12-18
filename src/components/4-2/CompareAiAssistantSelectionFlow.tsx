import { getS3ImageURL } from '../../utils/loading';
import { CompareAiAssistantSelectionInterface } from '../../data/scripts/4-2';
import styles from './CompareAiAssistants.module.css';
import { SpeechBubble } from '../SpeechBubble';
import { Show, createSignal, createEffect, onCleanup } from 'solid-js';
import { useMoaiConversation } from '../../utils/hooks/useMoaiConversation';

type CompareAiAssistantSelectionFlowProps = {
  scripts: CompareAiAssistantSelectionInterface[];
  onAllComplete: () => void;
};

export function CompareAiAssistantSelectionFlow(props: CompareAiAssistantSelectionFlowProps) {
  // Moai 대화 기능 사용
  const conversation = useMoaiConversation(
    () => props.scripts,
    props.onAllComplete,
    { typingSpeed: 150 }
  );

  const [isAutoPlay, setIsAutoPlay] = createSignal(false);
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;

  // 자동 재생 모드: 마지막 스크립트 전까지 스크립트 완료 시 자동으로 다음으로 진행
  createEffect(() => {
    if (!isAutoPlay()) {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
      return;
    }

    // 현재 스크립트가 완료되었고 마지막이 아니면 자동 진행
    if (conversation.isComplete() && !conversation.isLastScript()) {
      if (autoProceedTimeout) return;
      autoProceedTimeout = setTimeout(() => {
        conversation.proceedToNext();
        autoProceedTimeout = null;
      }, 400);
    } else {
      if (autoProceedTimeout) {
        clearTimeout(autoProceedTimeout);
        autoProceedTimeout = null;
      }
    }
  });

  onCleanup(() => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  });

  return (
    <div
      class={styles.selectionFlowContainer}
      style={{ 'background-image': `url(${getS3ImageURL(conversation.currentScript()?.bgPng || '')})` }}
    >
      <div class={styles.selectionFlowContent}>
        {/* 자동 재생 토글 버튼 */}
        <div
          style={{
            position: 'absolute',
            top: '2rem',
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
        <img
          src={getS3ImageURL(conversation.currentScript()?.maiPng || '')}
          alt="mai"
          class={styles.selectionFlowMai}
        />
        <SpeechBubble
          message={conversation.displayedMessage()}
          size={800}
          showNavigation={!isAutoPlay()}
          onNext={isAutoPlay() ? undefined : conversation.proceedToNext}
          onPrev={isAutoPlay() ? undefined : conversation.proceedToPrev}
          isComplete={conversation.isComplete}
          canGoNext={() => {
            // 자동 재생 모드에서는 다음 버튼 숨김
            if (isAutoPlay()) return false;
            // 마지막 스크립트일 때는 다음 버튼 숨김
            if (conversation.isLastScript()) return false;
            return conversation.isComplete();
          }}
          canGoPrev={() => !isAutoPlay() && conversation.currentScriptIndex() > 0}
        />
        <Show when={conversation.isLastScript() && conversation.isComplete()}>
          <div class={styles.nextButtonContainer}>
            <button
              onClick={props.onAllComplete}
              class={styles.nextButton}
            >
              다음으로
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
