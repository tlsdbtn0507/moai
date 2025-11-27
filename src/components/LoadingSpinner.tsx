import styles from './LoadingSpinner.module.css';

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
};

export function LoadingSpinner(props: LoadingSpinnerProps = {}) {
  const size = () => props.size || 'fullscreen';
  
  return (
    <div class={styles.spinnerContainer} classList={{
      [styles.small]: size() === 'small',
      [styles.medium]: size() === 'medium',
      [styles.large]: size() === 'large',
      [styles.fullscreen]: size() === 'fullscreen',
    }}>
      <div class={styles.spinner} classList={{
        [styles.smallSpinner]: size() === 'small',
        [styles.mediumSpinner]: size() === 'medium',
        [styles.largeSpinner]: size() === 'large',
      }}></div>
    </div>
  );
}

