import { createSignal, onMount, Show } from 'solid-js';
import { getS3ImageURL, getS3TTSURL, preloadImages } from '../../utils/loading';
import { generateImageFromPrompt } from '../../utils/gptImage';
import { SpeechBubble } from '../SpeechBubble';
import { SelectSunset } from './SelectSunset';
import { ConfirmButton } from './ConfirmButton';
import { DescribeModal } from './modal/DescribeModal';
import { CompareModal } from './modal/CompareModal';
import { LoadingModal } from './modal/LoadingModal';
import { LoadingSpinner } from '../LoadingSpinner';
import { useDescribeImageStore } from '../../store/1/3/describeImageStore';

import pageContainerStyles from '../../styles/PageContainer.module.css';

const DescribeImage = () => {
  const backgroundImageStyle = getS3ImageURL('sunsetOfMoai.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;
  
  const fullMessage = "우와.. 오늘 노을 진짜 이쁘다. 네가 살던 곳의 노을은 어땠어?";
  
  const [displayedMessage, setDisplayedMessage] = createSignal('');
  const [showSelectSunset, setShowSelectSunset] = createSignal(false);
  const [showConfirmButton, setShowConfirmButton] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = createSignal(false);
  const [selectedValue, setSelectedValue] = createSignal<'mt' | 'sea' | 'city' | null>(null);
  const [userInput, setUserInput] = createSignal('');
  const [generatedImageUrl, setGeneratedImageUrl] = createSignal<string | null>(null);
  const [generationError, setGenerationError] = createSignal<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = createSignal(false);
  const [isReady, setIsReady] = createSignal(false);
  let handleSelectRef: ((value: 'mt' | 'sea' | 'city') => void) | null = null;

  const handleDescriptionSubmit = async (description: string) => {
    setUserInput(description);
    setGenerationError(null);
    setGeneratedImageUrl(null);
    setIsGeneratingImage(true);
    setIsModalOpen(false);
    try {
      const url = await generateImageFromPrompt(description);
      setGeneratedImageUrl(url);
      setIsCompareModalOpen(true);
    } catch (error) {
      console.error('이미지 생성 실패', error);
      setGenerationError(error instanceof Error ? error.message : '이미지 생성에 실패했습니다.');
      setIsModalOpen(true);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  onMount(async () => {
    // 이미지 프리로드
    try {
      await preloadImages([backgroundImageStyle]);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }

    // 오디오 파일 목록
    const audioFiles = [
      getS3TTSURL('1-3_Introduction_1.mp3'),
      getS3TTSURL('1-3_Introduction_2.mp3'),
      getS3TTSURL('1-3_Introduction_3.mp3'),
    ];

    let audioIndex = 0;
    let currentAudio: HTMLAudioElement | null = null;
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
      }, 150); // 200ms마다 한 글자씩 추가
    };

    // 오디오 재생 함수 (단일 오디오만 재생)
    const playAudio = (index: number, onEnded?: () => void) => {
      if (index >= audioFiles.length) {
        console.log('✅ 모든 오디오 재생 완료');
        return;
      }

      console.log(`🎵 오디오 재생 시도: ${audioFiles[index]} (${index + 1}/${audioFiles.length})`);
      currentAudio = new Audio(audioFiles[index]);
      
      // 오디오 로드 대기
      currentAudio.addEventListener('loadeddata', () => {
        console.log(`📦 오디오 로드 완료: ${audioFiles[index]}`);
        const playPromise = currentAudio!.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`▶️ 오디오 재생 성공: ${audioFiles[index]}`);
            })
            .catch((error) => {
              console.error(`❌ 오디오 재생 실패: ${audioFiles[index]}`, error);
              console.error('에러 상세:', {
                name: error.name,
                message: error.message,
              });
            });
        }
      });

      // 오디오 재생 완료 시
      currentAudio.addEventListener('ended', () => {
        console.log(`✅ 오디오 재생 완료: ${audioFiles[index]}`);
        if (onEnded) {
          onEnded();
        }
        if (index < audioFiles.length - 1) {
          console.log('👆 다음 단계를 위해 클릭을 기다립니다...');
        }
      });

      // 오디오 로드 에러 처리
      currentAudio.addEventListener('error', (e) => {
        console.error(`❌ 오디오 로드 실패: ${audioFiles[index]}`, e);
        console.error('오디오 요소 상태:', {
          readyState: currentAudio!.readyState,
          networkState: currentAudio!.networkState,
          error: currentAudio!.error,
        });
      });

      // 오디오 로드 시작
      currentAudio.load();
    };

    // 다음 단계 진행 함수 (클릭 이벤트용)
    const proceedToNext = () => {
      audioIndex++;
      if (audioIndex < audioFiles.length) {
        console.log(`🚀 다음 단계 시작: ${audioIndex + 1}`);
        // 클릭 이벤트 제거 (중복 방지)
        document.removeEventListener('click', handleClick);
        document.removeEventListener('touchstart', handleClick);
        
        // 다음 오디오 재생 (끝나면 다시 클릭 이벤트 등록)
        playAudio(audioIndex, () => {
          if (audioIndex < audioFiles.length - 1) {
            // 마지막 오디오가 아니면 다시 클릭 이벤트 등록
            document.addEventListener('click', handleClick);
            document.addEventListener('touchstart', handleClick);
          }
        });
        startTyping(fullMessage); // 두 번째부터도 같은 메시지 사용 (필요시 수정 가능)
      }
    };

    // 클릭 이벤트 핸들러
    const handleClick = () => {
      if (audioIndex < audioFiles.length - 1) {
        proceedToNext();
      }
    };

    // 선택지 선택 핸들러
    const handleSelect = (value: 'mt' | 'sea' | 'city') => {
      console.log('선택된 값:', value);
      setShowSelectSunset(false);
      setSelectedValue(value); // 로컬 state 저장
      useDescribeImageStore.getState().setSelectedImage(value); // store에 저장
      
      // 새로운 메시지로 변경
      const newMessage = "정말 대단해! 한번 보고 싶은걸?\n혹시 나한테 노을의 풍경을 설명해줄 수 있어?\n내가 너의 설명을 듣고 멋진 노을을 그려줄게";
      
      // 새로운 메시지로 타이핑 시작
      startTyping(newMessage);
      
      // Introduction_2 재생 (끝나면 버튼 표시)
      playAudio(1, () => {
        // 두 번째 오디오 재생 완료 시 버튼 표시
        console.log('두 번째 오디오 재생 완료');
        setShowConfirmButton(true);
      });
    };
    
    // 외부에서 접근할 수 있도록 ref에 할당
    handleSelectRef = handleSelect;

    // 첫 번째 오디오와 대사 자동 재생 (1초 후)
    console.log('⏳ 1초 후 첫 번째 대사 애니메이션과 TTS 시작...');
    setTimeout(() => {
      console.log('🚀 첫 번째 대사 애니메이션과 TTS 시작!');
      // 첫 번째 오디오 재생 시작 (끝나면 선택지 표시)
      playAudio(0, () => {
        // 첫 번째 오디오가 끝나면 선택지 컴포넌트 표시
        setShowSelectSunset(true);
      });
      // 첫 번째 대사 타이핑 시작
      setTimeout(() => {
        startTyping(fullMessage);
      }, 500); // 오디오 시작 후 0.5초 뒤 대사 시작
    }, 1000);

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
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
      <SpeechBubble message={displayedMessage()} />
      {showSelectSunset() && handleSelectRef && (
        <div style={{     
            position: 'absolute',
            top: '48%',
            left: '53%', }}>
          <SelectSunset onSelect={handleSelectRef} />
        </div>
      )}
      {showConfirmButton() && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '80%',
          transform: 'translateX(-50%)',
        }}>
          <ConfirmButton onClick={() => {
            setIsModalOpen(true);
          }} />
        </div>
      )}
      <DescribeModal 
        isOpen={isModalOpen() && !isGeneratingImage()} 
        onClose={() => setIsModalOpen(false)}
        selectedValue={selectedValue()}
        isSubmitting={isGeneratingImage()}
        generatedImageUrl={generatedImageUrl()}
        errorMessage={generationError()}
        userInput={userInput()}
        onSubmit={handleDescriptionSubmit}
      />
      <LoadingModal isOpen={isGeneratingImage()} />
      {generatedImageUrl() && (
        <CompareModal
          isOpen={isCompareModalOpen()}
          onClose={() => setIsCompareModalOpen(false)}
          generatedImageUrl={generatedImageUrl()!}
        />
      )}
      </div>
    </Show>
  );
};

export default DescribeImage;