import { Show, onMount, createSignal } from 'solid-js';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';

const DetermineInfo = () => {
  const [isReady, setIsReady] = createSignal(false);
  const backgroundImageStyle = getS3ImageURL('2-7/desk.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;
  
  const fullMessage = "AI가 제공하는 정보의 출처를 판단하는 것은 정말 중요해. 오늘은 이에 대해 함께 배워볼까?";
  
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();

  // 스킵 컨트롤 훅
  useSkipControls({
    isTypingSkipped: typingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      typingAnimation.skipTyping();
      typingAnimation.setDisplayedMessage(fullMessage);
    },
    onSecondSkip: () => {
      audioPlayback.stopAudio();
    },
  });

  onMount(async () => {
    try {
      await preloadImages([backgroundImageStyle]);
      setIsReady(true);
    } catch (error) {
      setIsReady(true);
    }

    const audioFiles = [
      '2-7/Introduction_1.mp3',
    ];

    // 첫 번째 오디오와 대사 자동 재생
    setTimeout(() => {
      audioPlayback.playAudio(audioFiles[0], {
        onEnded: () => {
          // 오디오 재생 완료 후 처리
        },
      });
      setTimeout(() => {
        typingAnimation.startTyping(fullMessage);
      }, 500);
    }, 1000);
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        class={pageContainerStyles.container}
        style={{
          position: 'relative',
          'background-image': backgroundImageStyleURL,
          'background-size': 'cover',
          'background-position': 'center',
          display: 'flex',
          'align-items': 'center',
          'flex-direction': 'column-reverse',
          padding: '0 2rem 2rem',
        }}
      >
        <SpeechBubble message={typingAnimation.displayedMessage()} />
      </div>
    </Show>
  );
};

export default DetermineInfo;
