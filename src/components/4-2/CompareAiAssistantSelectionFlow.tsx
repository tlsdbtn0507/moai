import { getS3ImageURL } from '../../utils/loading';
import { CompareAiAssistantSelectionInterface } from '../../data/scripts/4-2';
import styles from './CompareAiAssistants.module.css';
import { SpeechBubble } from '../SpeechBubble';
import { Show } from 'solid-js';
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

  return (
    <div
      class={styles.selectionFlowContainer}
      style={{ 'background-image': `url(${getS3ImageURL(conversation.currentScript()?.bgPng || '')})` }}
    >
      <div class={styles.selectionFlowContent}>
        <img
          src={getS3ImageURL(conversation.currentScript()?.maiPng || '')}
          alt="mai"
          class={styles.selectionFlowMai}
        />
        <SpeechBubble
          message={conversation.displayedMessage()}
          size={800}
          showNavigation={true}
          onNext={conversation.proceedToNext}
          onPrev={conversation.proceedToPrev}
          isComplete={conversation.isComplete}
          canGoNext={() => {
            // 마지막 스크립트일 때는 다음 버튼 숨김
            if (conversation.isLastScript()) return false;
            return conversation.isComplete();
          }}
          canGoPrev={() => conversation.currentScriptIndex() > 0}
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
