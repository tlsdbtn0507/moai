import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import styles from './CompareModal.module.css';
import { SpeechBubble } from '../../SpeechBubble';
import { ConfirmButton } from '../ConfirmButton';
import { getS3TTSURL } from '../../../utils/loading';

type CompareModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  generatedImageUrl: string;
};

const fullMessage = `너의 설명을 듣고 이렇게 그려봤어!
어때? 너가 봤던 장면과 비슷한 거 같아?
다른 점을 나한테 알려줄래?`;

export function CompareModal(props: CompareModalProps) {
  const [displayedMessage, setDisplayedMessage] = createSignal('');
  let typingInterval: ReturnType<typeof setInterval> | null = null;

  // 타이핑 애니메이션 함수
  const startTyping = (message: string) => {
    // 기존 타이핑 인터벌 정리
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    
    let typingIndex = 0;
    setDisplayedMessage(''); // 메시지 초기화
    
    typingInterval = setInterval(() => {
      if (typingIndex < message.length) {
        setDisplayedMessage(message.slice(0, typingIndex + 1));
        typingIndex++;
      } else {
        if (typingInterval) {
          clearInterval(typingInterval);
          typingInterval = null;
        }
      }
    }, 150); // 150ms마다 한 글자씩 추가
  };

  // 모달이 열릴 때 Introduction3 오디오 재생 및 타이핑 애니메이션
  createEffect(() => {
    if (props.isOpen) {
      const audioFile = getS3TTSURL('1-3_Introduction_3.mp3');
      const audio = new Audio(audioFile);
      
      audio.addEventListener('loadeddata', () => {
        audio.play().catch((error) => {
          console.error('오디오 재생 실패:', error);
        });
        
        // 오디오 재생 후 0.5초 뒤에 타이핑 애니메이션 시작
        setTimeout(() => {
          startTyping(fullMessage);
        }, 500);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('오디오 로드 실패:', e);
      });
      
      audio.load();
      
      // 컴포넌트 언마운트 시 정리
      return () => {
        audio.pause();
        audio.src = '';
        if (typingInterval) {
          clearInterval(typingInterval);
          typingInterval = null;
        }
      };
    } else {
      // 모달이 닫힐 때 메시지 초기화
      setDisplayedMessage('');
      if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
      }
    }
  });

  // 컴포넌트 언마운트 시 정리
  onCleanup(() => {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
  });

  return (
    <Show when={props.isOpen}>
      <div class={styles.overlay} onClick={props.onClose}>
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div class={styles.imageContainer}>
            <img
              src={props.generatedImageUrl}
              alt="생성된 이미지"
              class={styles.generatedImage}
            />
            <SpeechBubble 
              message={displayedMessage() || ''}
              size={600}
            />
            <Show when={displayedMessage().length === fullMessage.length}>
              <div class={styles.buttonContainer}>
                <ConfirmButton 
                  onClick={() => {
                    // 버튼 클릭 시 처리 (필요시 추가)
                  }}
                  text="그래, 알겠어!"
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}

