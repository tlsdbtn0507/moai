import { Show, createSignal } from 'solid-js';
import styles from './CompareModal.module.css';
import modalStyles from './Modal.module.css';

type ComparisonImagesProps = {
  isOpen: boolean;
  selectedImageUrl: string | null;
  generatedImageUrl: string;
  onClose?: () => void;
  onSubmitNext?: () => void;
  onReset?: () => void;
};

export function ComparisonImages(props: ComparisonImagesProps) {
  const [description, setDescription] = createSignal('');

  return (
    <Show when={props.isOpen}>
      <div class={styles.overlay} onClick={props.onClose}>
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div class={styles.comparisonContainer}>
            <div class={styles.imageRow}>
              <div class={styles.imageColumn}>
                <h3 class={styles.imageTitle}>내가 생각한 풍경</h3>
                <Show when={props.selectedImageUrl}>
                  <img
                    src={props.selectedImageUrl!}
                    alt="선택한 풍경"
                    class={styles.comparisonImage}
                  />
                </Show>
              </div>
              <div class={styles.imageColumn}>
                <h3 class={styles.imageTitle}>MAI가 그린 그림</h3>
                <img
                  src={props.generatedImageUrl}
                  alt="생성된 이미지"
                  class={styles.comparisonImage}
                />
              </div>
            </div>
            <p class={styles.questionText}>두 그림의 어떤 부분이 다른가요?</p>
            <form
              class={modalStyles.inputGroup}
              onSubmit={(e) => {
                e.preventDefault();
                const value = description().trim();
                if (!value) return;
                if (props.onSubmitNext) {
                  props.onSubmitNext();
                }
              }}
            >
              <input
                type="text"
                class={modalStyles.descriptionInput}
                placeholder="어떤 부분이 다른지 자세하게 적어보세요."
                value={description()}
                onInput={(event) => setDescription(event.currentTarget.value)}
              />
              <button type="submit" class={modalStyles.submitButton}>
                입력
              </button>
            </form>
            <div class={styles.nextButtonContainer}>
              <button
                class={styles.nextButton}
                onClick={() => {
                  if (props.onReset) {
                    props.onReset();
                  }
                }}
              >
                그림 다시 그리기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}

export default ComparisonImages;