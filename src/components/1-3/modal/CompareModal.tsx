import { Show, createEffect, createSignal, createMemo } from 'solid-js';
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
import { ComparisonImages } from './ComparisonImages';

type CompareModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  generatedImageUrl: string;
  onReset?: () => void;
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
  const [hasStarted, setHasStarted] = createSignal(false); // 이미 시작했는지 추적
  
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
    const open = props.isOpen;
    const comparing = showComparison();

    if (!open) {
      // 모달 닫힐 때 정리
      typingAnimation.setDisplayedMessage('');
      typingAnimation.resetSkipState();
      audioPlayback.stopAudio();
      setHasStarted(false); // 플래그 리셋
      return;
    }

    // 비교 화면이면 오디오 재생/시작을 막고 즉시 정지
    if (comparing) {
      audioPlayback.stopAudio();
      return;
    }

    // 이미 시작했거나 타이핑 애니메이션이 완료되었으면 실행하지 않음
    if (hasStarted() || typingAnimation.displayedMessage().length === fullMessage.length) {
      return;
    }

    // 스킵 상태 초기화 후 오디오/타이핑 시작
    typingAnimation.resetSkipState();
    setHasStarted(true); // 시작 플래그 설정
    
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
                    // 오디오 상태와 관계없이 정지 후 비교 화면 표시
                    audioPlayback.stopAudio();
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
      <ComparisonImages
        isOpen={showComparison()}
        selectedImageUrl={selectedImageUrl()}
        generatedImageUrl={props.generatedImageUrl}
        onClose={props.onClose}
        onSubmitNext={() => {
                const nextStepId = String(parseInt(params.stepId || '1', 10) + 1);
                navigate(`/${params.worldId}/${params.classId}/${nextStepId}`);
        }}
        onReset={() => {
                    useDescribeImageStore.getState().resetPrompt();
                    if (props.onReset) {
                      props.onReset();
                    }
                  }}
      />
    </>
  );
}

