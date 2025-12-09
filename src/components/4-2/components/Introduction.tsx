import { Show } from 'solid-js';
import { getS3ImageURL } from '../../../utils/loading';
import { ConfirmButton } from '../../1-3/ConfirmButton';
import { SpeechBubble } from '../../SpeechBubble';
import { useTypingAnimation } from '../../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../../utils/hooks/useSkipControls';
import styles from './Introduction.module.css';
import pageContainerStyles from '../../../styles/PageContainer.module.css';

interface IntroductionProps {
  aiAssistantName: string;
  onNext: () => void;
}

const Introduction = (props: IntroductionProps) => {
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();
  
  // 한글의 마지막 글자에 받침이 있는지 확인하는 함수
  const hasFinalConsonant = (text: string): boolean => {
    if (!text) return false;
    
    // 마지막 글자 찾기 (공백 제거 후)
    const trimmedText = text.trim();
    if (!trimmedText) return false;
    
    const lastChar = trimmedText[trimmedText.length - 1];
    const charCode = lastChar.charCodeAt(0);
    
    // 한글 유니코드 범위: AC00-D7A3
    if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
      // 받침 유무 확인: (charCode - 0xAC00) % 28
      // 0이면 받침 없음, 0이 아니면 받침 있음
      return (charCode - 0xAC00) % 28 !== 0;
    }
    
    // 한글이 아니면 기본값으로 받침 있음으로 처리 (이야 사용)
    return true;
  };
  
  // 받침 유무에 따라 적절한 조사 선택
  const particle = hasFinalConsonant(props.aiAssistantName) ? '이야' : '야';
  const speechBubbleMessage = `반가워 난 너만의 AI 비서 ${props.aiAssistantName}${particle} 이제 내가 잘 작동하는지 시험해볼까?`;
  
  // 타이핑 애니메이션 시작
  typingAnimation.startTyping(speechBubbleMessage);
  
  // 오디오 재생
  audioPlayback.playAudio('4-2/introduction.mp3');
  
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
        <img src={getS3ImageURL('4-2/completedAssistant.png')} class={styles.aiAssistantImage} />
        <div class={styles.maiImageWrapper}>
          <SpeechBubble message={typingAnimation.displayedMessage()} size={600} type='simple' />
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

export default Introduction;