import styles from './ConfirmButton.module.css';

type ConfirmButtonProps = {
  onClick: () => void;
};

export function ConfirmButton(props: ConfirmButtonProps) {
  return (
    <button class={styles.button} onClick={props.onClick}>
      응,좋아!
    </button>
  );
}

