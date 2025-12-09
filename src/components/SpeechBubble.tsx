import { createSignal, onMount, Show, createEffect } from 'solid-js';
import styles from './SpeechBubble.module.css';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { LoadingSpinner } from './LoadingSpinner';

type SpeechBubbleType = 'default' | 'simple' | 'smartie' | 'kylie' | 'logos';

type SpeechBubbleProps = {
  message: string;
  size?: number;
  type?: SpeechBubbleType;
};

export function SpeechBubble(props: SpeechBubbleProps) {
  const [isReady, setIsReady] = createSignal(false);
  const [backgroundImageStyleURL, setBackgroundImageStyleURL] = createSignal<string>('');
  const [isImageLoading, setIsImageLoading] = createSignal(false);
  
  // type에 따라 이미지 선택
  const getImageName = (): string => {
    const type = props.type || 'default';
    switch (type) {
      case 'simple':
        return '4-2/simpleSpeechBubble.png';
      case 'smartie':
        return '4-2/smartieSpeechBubble.png';
      case 'kylie':
        return '4-2/kylieSpeechBubble.png';
      case 'logos':
        return '4-2/logosSpeechBubble.png';
      case 'default':
      default:
        return 'speechBubble.png';
    }
  };
  
  // 초기 마운트 시 이미지 로드
  onMount(async () => {
    const imageName = getImageName();
    const imageUrl = getS3ImageURL(imageName);
    
    try {
      await preloadImages([imageUrl]);
      setBackgroundImageStyleURL(`url(${imageUrl})`);
      setIsReady(true);
    } catch (error) {
      setBackgroundImageStyleURL(`url(${imageUrl})`);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });
  
  // type이 변경될 때마다 이미지 다시 로드 (기존 이미지 유지하면서)
  createEffect(async () => {
    const imageName = getImageName();
    const imageUrl = getS3ImageURL(imageName);
    const currentUrl = backgroundImageStyleURL();
    
    // 이미 같은 이미지면 스킵
    if (currentUrl === `url(${imageUrl})`) return;
    
    // 이미 로드 중이면 스킵
    if (isImageLoading()) return;
    
    // 초기 로드가 완료되지 않았으면 스킵 (onMount에서 처리)
    if (!isReady()) return;
    
    setIsImageLoading(true);
    try {
      await preloadImages([imageUrl]);
      // 새 이미지 로드 완료 후 전환
      setBackgroundImageStyleURL(`url(${imageUrl})`);
    } catch (error) {
      // 에러가 발생해도 이미지 URL은 설정
      setBackgroundImageStyleURL(`url(${imageUrl})`);
    } finally {
      setIsImageLoading(false);
    }
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        style={{
          'background-image': backgroundImageStyleURL(),
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-size': 'contain',
          width: `${props.size || 650}px`,
          height: '198px',
          display: 'flex',
          'flex-direction': 'column-reverse',
          'justify-content': 'center',
          'align-items': 'center',
          padding: '2rem 4rem 1.4rem 4rem',
          'text-align': 'center',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isImageLoading() ? 0.7 : 1,
        }}
      >
        <p style={{ 'font-size': '1.4rem', 'font-weight': '700', color: '#3b1a07', 'white-space': 'pre-line' }}>{props.message}</p>
      </div>
    </Show>
  );
}

