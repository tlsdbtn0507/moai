import { createSignal, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { SelectSunset } from './SelectSunset';
import { ConfirmButton } from './ConfirmButton';
import { LoadingSpinner } from '../LoadingSpinner';
import { useDescribeImageStore } from '../../store/1/3/describeImageStore';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useSkipControls } from '../../utils/hooks/useSkipControls';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';

import pageContainerStyles from '../../styles/PageContainer.module.css';

const DescribeImage = () => {
  const navigate = useNavigate();
  const backgroundImageStyle = getS3ImageURL('sunsetOfMoai.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;
  
  const firstMessage = "우와.. 오늘 노을 진짜 이쁘다. 네가 살던 곳의 노을은 어땠어?";
  // const secondMessage = "정말 대단해! 한번 보고 싶은걸?\n혹시 나한테 노을의 풍경을 설명해줄 수 있어?\n내가 너의 설명을 듣고 멋진 노을을 그려줄게";
  
  const [showConfirmButton, setShowConfirmButton] = createSignal(false);
  const [selectedValue, setSelectedValue] = createSignal<'mt' | 'sea' | 'city' | null>(null);
  const [userInput, setUserInput] = createSignal('');
  const [isReady, setIsReady] = createSignal(false);
  
  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();
  
  let handleSelectRef: ((value: 'mt' | 'sea' | 'city') => void) | null = null;
  // 두 번째 대사 비활성화: 현재 메시지는 항상 firstMessage만 사용
  const currentMessage = () => firstMessage;

  onMount(async () => {
    // 이미지 프리로드
    try {
      await preloadImages([backgroundImageStyle]);
      setIsReady(true);
    } catch (error) {
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }

    // 사용자 선택값 로컬스토리지 복원
    const savedValue = localStorage.getItem('describeSelectedValue');
    if (savedValue === 'mt' || savedValue === 'sea' || savedValue === 'city') {
      setSelectedValue(savedValue);
    }

    // 선택지 선택 핸들러
    const handleSelect = (value: 'mt' | 'sea' | 'city') => {
      setSelectedValue(value); // 로컬 state 저장
      localStorage.setItem('describeSelectedValue', value); // 페이지 이동 대비 저장
      useDescribeImageStore.getState().setSelectedImage(value); // store에 저장
      localStorage.removeItem('describeGeneratedImageUrl'); // 이전에 생성된 이미지 URL 제거
      audioPlayback.stopAudio(); // 선택 시 인트로 오디오 중단
      
      // 스킵 상태 초기화
      typingAnimation.resetSkipState();
      
      // 선택 후 바로 CompareImage 단계로 이동
      navigate('/1/3/2');
    };
    
    // 외부에서 접근할 수 있도록 ref에 할당
    handleSelectRef = handleSelect;

    // 스킵 컨트롤 훅 (스페이스바)
    useSkipControls({
      isTypingSkipped: typingAnimation.isTypingSkipped,
      onFirstSkip: () => {
        typingAnimation.skipTyping();
        typingAnimation.setDisplayedMessage(currentMessage());
        // 첫 대사 스킵 시 선택지 바로 노출
        setShowConfirmButton(true);
      },
    });

    // 첫 메시지 타이핑 시작 후 선택지 노출
    // 인트로 오디오 재생 시작
    audioPlayback.playAudio('1-3_Introduction_1.mp3');
    typingAnimation.startTyping(firstMessage);
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
      {(typingAnimation.displayedMessage().length === firstMessage.length || typingAnimation.isTypingSkipped()) && handleSelectRef && (
        <div style={{     
            position: 'absolute',
            top: '38%',
            left: '35%', }}>
          <SelectSunset onSelect={handleSelectRef} />
        </div>
      )}
      {/* {showConfirmButton() && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '80%',
          transform: 'translateX(-50%)',
        }}>
          <ConfirmButton onClick={() => {
            // 1/3/2로 이동하여 CompareImage 단계로 진행
            navigate('/1/3/2');
          }} />
        </div>
      )}       */}
      </div>
    </Show>
  );
};

export default DescribeImage;