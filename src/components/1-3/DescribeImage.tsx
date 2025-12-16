import { createSignal, onMount, Show, createEffect } from 'solid-js';
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
  
  const firstMessage = "우와.. 오늘 노을 진짜 이쁘다.\n네가 살던 곳의 노을은 어땠어?";
  const secondMessage = "정말 대단해! 한번 보고 싶은걸?\n혹시 나한테 노을의 풍경을 설명해줄 수 있어?\n내가 너의 설명을 듣고 멋진 노을을 그려줄게";
  
  // 스크립트 히스토리용 배열
  const scriptHistory = [
    { id: 1, script: firstMessage },
    { id: 2, script: secondMessage },
  ];
  
  // 현재 스크립트 인덱스
  const currentScriptIndex = () => showSecondMessage() ? 1 : 0;
  
  const [showConfirmButton, setShowConfirmButton] = createSignal(false);
  const [selectedValue, setSelectedValue] = createSignal<'mt' | 'sea' | 'city' | null>(null);
  const [userInput, setUserInput] = createSignal('');
  const [isReady, setIsReady] = createSignal(false);
  const [showSelectSunset, setShowSelectSunset] = createSignal(false);
  const [showSecondMessage, setShowSecondMessage] = createSignal(false);
  
  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();
  
  let handleSelectRef: ((value: 'mt' | 'sea' | 'city') => void) | null = null;
  // 현재 메시지 결정
  const currentMessage = () => {
    if (showSecondMessage()) {
      return secondMessage;
    }
    return firstMessage;
  };

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
      
      // SelectSunset 컴포넌트 숨기기
      setShowSelectSunset(false);
      
      // 스킵 상태 초기화
      typingAnimation.resetSkipState();
      
      // 두 번째 대사 표시 및 오디오 재생
      setShowSecondMessage(true);
      audioPlayback.playAudio('1-3_Introduction_2.mp3');
      typingAnimation.startTyping(secondMessage);
    };
    
    // 외부에서 접근할 수 있도록 ref에 할당
    handleSelectRef = handleSelect;

    // 스킵 컨트롤 훅 (스페이스바)
    useSkipControls({
      isTypingSkipped: typingAnimation.isTypingSkipped,
      onFirstSkip: () => {
        typingAnimation.skipTyping();
        typingAnimation.setDisplayedMessage(currentMessage());
        // 첫 대사 스킵 시에는 아무것도 하지 않음 (두 번째 대사 스킵 시에만 ConfirmButton 표시)
      },
    });

    // 첫 메시지 타이핑 시작 후 선택지 노출
    // 인트로 오디오 재생 시작
    audioPlayback.playAudio('1-3_Introduction_1.mp3');
    typingAnimation.startTyping(firstMessage);
    setShowSelectSunset(true); // 첫 메시지 완료 후 SelectSunset 표시
  });

  // 두 번째 대사 완료 또는 스킵 시 ConfirmButton 표시
  createEffect(() => {
    if (showSecondMessage()) {
      const isTypingComplete = typingAnimation.displayedMessage().length === secondMessage.length || typingAnimation.isTypingSkipped();
      
      if (isTypingComplete) {
        setShowConfirmButton(true);
      }
    }
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
      <SpeechBubble 
        message={typingAnimation.displayedMessage()}
        scriptHistory={scriptHistory}
        currentScriptIndex={currentScriptIndex()}
      />
      {showSelectSunset() && (typingAnimation.displayedMessage().length === firstMessage.length || typingAnimation.isTypingSkipped()) && handleSelectRef && (
        <div style={{     
            position: 'absolute',
            top: '38%',
            left: '35%', }}>
          <SelectSunset onSelect={handleSelectRef} />
        </div>
      )}
      {showConfirmButton() && showSecondMessage() && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '80%',
          transform: 'translateX(-50%)',
        }}>
          <ConfirmButton onClick={() => {
            // 오디오 정지
            audioPlayback.stopAudio();
            // 1/3/2로 이동하여 CompareImage 단계로 진행
            navigate('/1/3/2');
          }} />
        </div>
      )}
      </div>
    </Show>
  );
};

export default DescribeImage;