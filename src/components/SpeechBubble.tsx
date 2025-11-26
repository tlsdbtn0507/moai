import styles from './SpeechBubble.module.css';
import { getS3ImageURL } from '../utils/loading';

type SpeechBubbleProps = {
  message: string;
};

export function SpeechBubble(props: SpeechBubbleProps) {
  const backgroundImageStyle = getS3ImageURL('speechBubble.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;
  return (
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
  );
}

