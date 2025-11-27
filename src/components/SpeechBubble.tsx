import { createSignal, onMount, Show } from 'solid-js';
import styles from './SpeechBubble.module.css';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { LoadingSpinner } from './LoadingSpinner';

type SpeechBubbleProps = {
  message: string;
};

export function SpeechBubble(props: SpeechBubbleProps) {
  const [isReady, setIsReady] = createSignal(false);
  const backgroundImageStyle = getS3ImageURL('speechBubble.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;

  onMount(async () => {
    try {
      await preloadImages([backgroundImageStyle]);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        style={{
          'background-image': backgroundImageStyleURL,
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-size': 'contain',
          width: '650px',
          height: '198px',
          display: 'flex',
          'flex-direction': 'column-reverse',
          'justify-content': 'center',
          'align-items': 'center',
          padding: '2rem 4rem 1.4rem 4rem',
          'text-align': 'center',
        }}
      >
        <p style={{ 'font-size': '1.4rem', 'font-weight': '700', color: '#3b1a07', 'white-space': 'pre-line' }}>{props.message}</p>
      </div>
    </Show>
  );
}

