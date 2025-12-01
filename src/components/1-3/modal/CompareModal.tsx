import { Show, createEffect, createSignal, onCleanup, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import styles from './CompareModal.module.css';
import { SpeechBubble } from '../../SpeechBubble';
import { ConfirmButton } from '../ConfirmButton';
import { getS3ImageURL } from '../../../utils/loading';
import { useDescribeImageStore } from '../../../store/1/3/describeImageStore';
import { useTypingAnimation } from '../../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../../utils/hooks/useSkipControls';
import modalStyles from './Modal.module.css';

type CompareModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  generatedImageUrl: string;
};

const fullMessage = `너의 설명을 듣고 이렇게 그려봤어!
어때? 너가 봤던 장면과 비슷한 거 같아?
다른 점을 나한테 알려줄래?`;

export function CompareModal(props: CompareModalProps) {
  const navigate = useNavigate();
  const params = useParams();
  const [showComparison, setShowComparison] = createSignal(false);
  const [description, setDescription] = createSignal('');
  const [selectedImage, setSelectedImage] = createSignal<'mt' | 'sea' | 'city' | null>(null);
  
  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  
  // 오디오 재생 훅
  const audioPlayback = useAudioPlayback();

  // zustand store에서 selectedImage 구독
  createEffect(() => {
    // 초기 값 설정
    setSelectedImage(useDescribeImageStore.getState().selectedImage);
    
    const unsubscribe = useDescribeImageStore.subscribe((state) => {
      setSelectedImage(state.selectedImage);
    });
    
    return unsubscribe;
  });

  // 선택된 이미지 URL 생성
  const selectedImageUrl = createMemo(() => {
    const image = selectedImage();
    if (!image) return null;
    const capitalized = image.charAt(0).toUpperCase() + image.slice(1);
    return getS3ImageURL(`sunsetOf${capitalized}.png`);
  });

  // 스킵 컨트롤 훅
  useSkipControls({
    isActive: () => props.isOpen,
    isTypingSkipped: typingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      typingAnimation.skipTyping();
      typingAnimation.setDisplayedMessage(fullMessage);
    },
    onSecondSkip: () => {
      audioPlayback.stopAudio();
      // 버튼이 이미 표시되어 있지 않으면 표시
      // (버튼은 displayedMessage가 fullMessage.length와 같을 때 표시되므로
      //  메시지를 설정하면 자동으로 표시됨)
    },
  });

  // 모달이 열릴 때 Introduction3 오디오 재생 및 타이핑 애니메이션
  createEffect(() => {
    if (props.isOpen) {
      // 스킵 상태 초기화
      typingAnimation.resetSkipState();
      
      // 오디오가 재생 중이 아닐 때만 재생 (첫 번째 스킵 시 오디오는 계속 재생되도록)
      if (!audioPlayback.isPlaying()) {
        audioPlayback.playAudio('1-3_Introduction_3.mp3', {
          onLoaded: () => {
        // 오디오 재생 후 0.5초 뒤에 타이핑 애니메이션 시작
        setTimeout(() => {
              typingAnimation.startTyping(fullMessage);
        }, 500);
          },
        });
      }
    } else {
      // 모달이 닫힐 때 메시지 초기화
      typingAnimation.setDisplayedMessage('');
      typingAnimation.resetSkipState();
      audioPlayback.stopAudio();
    }
  });

  return (
    <>
    <Show when={props.isOpen}>
      <div class={styles.overlay} onClick={props.onClose}>
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div class={styles.imageContainer}>
            <div class={styles.imageWrapper}>
                <img
                src={props.generatedImageUrl}
                alt="생성된 이미지"
                class={styles.generatedImage}
                />
            </div>
            <SpeechBubble 
              message={typingAnimation.displayedMessage() || ''}
              size={600}
            />
            <Show when={typingAnimation.displayedMessage().length === fullMessage.length}>
              <div class={styles.buttonContainer}>
                <ConfirmButton 
                  onClick={() => {
                    setShowComparison(true);
                  }}
                  text="그래, 알겠어!"
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
      </Show>
      <Show when={showComparison()}>
        <div class={styles.overlay} onClick={props.onClose}>
          <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div class={styles.comparisonContainer}>
              <div class={styles.imageRow}>
                <div class={styles.imageColumn}>
                  <h3 class={styles.imageTitle}>내가 생각한 풍경</h3>
                  <Show when={selectedImageUrl()}>
                    <img
                      src={selectedImageUrl()!}
                      alt="선택한 풍경"
                      class={styles.comparisonImage}
                    />
                  </Show>
                </div>
                <div class={styles.imageColumn}>
                  <h3 class={styles.imageTitle}>MAI가 그린 그림</h3>
                  <img
                    src={props.generatedImageUrl}
                    alt="생성된 이미지"
                    class={styles.comparisonImage}
                  />
                </div>
              </div>
              <p class={styles.questionText}>두 그림의 어떤 부분이 다른가요?</p>
              <form class={modalStyles.inputGroup} onSubmit={(e) => {
                e.preventDefault();
                const value = description().trim();
                if (!value) return;
                // 여기에 제출 처리 로직 추가 가능
                console.log('비교 설명:', value);
              }}>
                <input
                  type="text"
                  class={modalStyles.descriptionInput}
                  placeholder="어떤 부분이 다른지 자세하게 적어보세요."
                  value={description()}
                  onInput={(event) => setDescription(event.currentTarget.value)}
                />
                <button
                  type="submit"
                  class={modalStyles.submitButton}
                >
                  입력
                </button>
              </form>
              <div class={styles.nextButtonContainer}>
                <button
                  class={styles.nextButton}
                  disabled={!description().trim()}
                  onClick={() => {
                    if (!description().trim()) return;
                    // 다음 단계로 이동: /1/3/1 -> /1/3/2
                    const nextStepId = String(parseInt(params.stepId || '1', 10) + 1);
                    navigate(`/${params.worldId}/${params.classId}/${nextStepId}`);
                  }}
                >
                  다음으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}

