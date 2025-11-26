import { Show } from 'solid-js';
import styles from './Modal.module.css';

type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  children?: any;
};

export function Modal(props: ModalProps) {
  return (
    <Show when={props.isOpen}>
      <div class={styles.overlay} onClick={props.onClose}>
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
          {props.children}
        </div>
      </div>
    </Show>
  );
}


