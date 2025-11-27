import styles from './ConfirmButton.module.css';

type ConfirmButtonProps = {
  onClick: () => void;
  text?: string;
};

export function ConfirmButton(props: ConfirmButtonProps) {
  return (
    <button class={styles.button} onClick={props.onClick}>
      {props.text || '응,좋아!'}
    </button>
  );
}

