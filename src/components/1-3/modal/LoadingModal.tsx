import { Show } from 'solid-js';
import { getS3ImageURL } from '../../../utils/loading';
import styles from './LoadingModal.module.css';

type LoadingModalProps = {
  isOpen: boolean;
};

export function LoadingModal(props: LoadingModalProps) {
  const maiDrawingImageUrl = getS3ImageURL('maiDrawing.png');

  return (
    <Show when={props.isOpen}>
    {/* // <Show when={true}> */}
      <div class={styles.overlay}>
        <div class={styles.modal}>
          <img 
            src={maiDrawingImageUrl} 
            alt="MAI가 그리는 중" 
            class={styles.drawingImage}
          />
          <p class={styles.loadingText}>
            MAI가 그리는 중
            <span class={styles.dots}>
              <span class={styles.dot}>.</span>
              <span class={styles.dot}>.</span>
              <span class={styles.dot}>.</span>
            </span>
          </p>
        </div>
      </div>
    </Show>
  );
}

