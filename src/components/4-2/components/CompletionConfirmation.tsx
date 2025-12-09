import { Show } from 'solid-js';
import { getS3ImageURL } from '../../../utils/loading';
import { ConfirmButton } from '../../1-3/ConfirmButton';
import { SpeechBubble } from '../../SpeechBubble';
import { useTypingAnimation } from '../../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../../utils/hooks/useSkipControls';
import styles from './CompletionConfirmation.module.css';
import pageContainerStyles from '../../../styles/PageContainer.module.css';

interface CompletionConfirmationProps {
  onNext: () => void;
}

const CompletionConfirmation = (props: CompletionConfirmationProps) => {
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();
  
  const speechBubbleMessage = "좋아! 너만의 AI 비서 로봇이 완성됐어! 이제 이름을 정하고 바로 테스트해보자!";
  
  // 타이핑 애니메이션 시작
  typingAnimation.startTyping(speechBubbleMessage);
  
  // 오디오 재생
  audioPlayback.playAudio('4-2/4-2_practice_2.mp3');
  
  const isTypingComplete = () => {
    return typingAnimation.displayedMessage().length === speechBubbleMessage.length;
  };

  useSkipControls({
    isTypingSkipped: typingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      typingAnimation.skipTyping();
      typingAnimation.setDisplayedMessage(speechBubbleMessage);
    },
    onSecondSkip: () => {
      audioPlayback.stopAudio();
    },
  });

  const handleConfirm = () => {
    audioPlayback.stopAudio();
    props.onNext();
  };

  return (
    <div class={`${pageContainerStyles.container} ${styles.container}`} 
         style={{"background-color": "#BCCAFF"}}>
      <div class={styles.contentWrapper}>
        <div class={styles.spanWrapper}>
          <span>실습: AI 비서 만들기</span>
        </div>
        <img src={getS3ImageURL('4-2/completedAssistant.png')} class={styles.maiImage} />
        <div class={styles.maiImageWrapper}>
          <SpeechBubble message={typingAnimation.displayedMessage()} size={600} />
          <img style={{
            position: 'absolute',
            bottom: '-6rem',
            right: '-12rem',
            height: '500px'
          }} src={getS3ImageURL('4-2/finishingMai.png')} alt="" />
        </div>
        <Show when={isTypingComplete()}>
          <div class={styles.buttonWrapper}>
            <ConfirmButton onClick={handleConfirm} text="그래" />
          </div>
        </Show>
      </div>
    </div>
  );
};

export default CompletionConfirmation;