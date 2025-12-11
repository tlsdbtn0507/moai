import { Show, onMount, createSignal, createEffect, onCleanup } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { SpeechBubble } from '../SpeechBubble';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { useSkipControls } from '../../utils/hooks/useSkipControls';

// 임시 스크립트 데이터 (나중에 별도 파일로 분리 가능)
const determineInfoConceptScripts = [
  {
    id: 1,
    script: 'AI가 제공하는 정보의 출처를 판단하는 것은 매우 중요해.',
    voice: '2-7/Concept_1.mp3',
    maiPng: '2-7/mai.png',
    title: '정보 출처 판단의 중요성',
    concept: 'AI가 제공하는 정보는 항상 정확하지 않을 수 있으므로, 출처를 확인하고 신뢰성을 평가해야 합니다.',
  },
  {
    id: 2,
    script: '정보의 출처를 확인하면 더 정확한 답을 얻을 수 있어.',
    voice: '2-7/Concept_2.mp3',
    maiPng: '2-7/mai.png',
    title: '출처 확인의 필요성',
    concept: '정보의 출처를 확인함으로써 정보의 신뢰성과 정확성을 판단할 수 있습니다.',
  },
];

const DetermineInfoConcept = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [currentTitle, setCurrentTitle] = createSignal<string | undefined>(undefined);
  const [currentConcept, setCurrentConcept] = createSignal(determineInfoConceptScripts[0]?.concept || '');
  const [characterImageUrl, setCharacterImageUrl] = createSignal(getS3ImageURL('2-7/mai.png'));
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false);
  let autoProceedTimeout: ReturnType<typeof setTimeout> | null = null;
  const navigate = useNavigate();
  const params = useParams();
  
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();

  const currentScript = () => determineInfoConceptScripts[currentScriptIndex()];

  const cancelAutoProceed = () => {
    if (autoProceedTimeout) {
      clearTimeout(autoProceedTimeout);
      autoProceedTimeout = null;
    }
  };

  const goToNextStep = () => {
    const worldId = params.worldId || '2';
    const classId = params.classId || '7';
    const nextStepId = '3';
    navigate(`/${worldId}/${classId}/${nextStepId}`);
  };

  const restartFromBeginning = () => {
    cancelAutoProceed();
    audioPlayback.stopAudio();
    typingAnimation.resetSkipState();
    setWasSkipped(false);
    setCurrentScriptIndex(0);
  };

  const isLastScript = () => {
    return currentScriptIndex() >= determineInfoConceptScripts.length - 1;
  };

  const proceedToNext = () => {
    cancelAutoProceed();
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < determineInfoConceptScripts.length) {
      typingAnimation.resetSkipState();
      setWasSkipped(false);
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
    } else {
      goToNextStep();
    }
  };

  // 스킵 컨트롤 훅 (컴포넌트 레벨에서 호출)
  useSkipControls({
    isTypingSkipped: typingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      const script = currentScript();
      if (script) {
        typingAnimation.skipTyping();
        typingAnimation.setDisplayedMessage(script.script);
        setWasSkipped(true);
      }
    },
    onSecondSkip: () => {
      cancelAutoProceed();
      audioPlayback.stopAudio();
      if (currentScriptIndex() >= determineInfoConceptScripts.length - 1) {
        // 마지막 스크립트에서는 자동 진행하지 않음
      } else {
        proceedToNext();
      }
    },
  });

  createEffect(() => {
    const script = currentScript();
    if (!script) return;
    const scriptIndex = currentScriptIndex();

    setCurrentTitle(script.title);
    setCurrentConcept(script.concept);
    setCharacterImageUrl(getS3ImageURL(script.maiPng));

    if (!wasSkipped() || !audioPlayback.isPlaying()) {
      audioPlayback.playAudio(script.voice, {
        onEnded: () => {
          if (scriptIndex < determineInfoConceptScripts.length - 1) {
            if (wasSkipped()) {
              cancelAutoProceed();
              autoProceedTimeout = setTimeout(() => {
                proceedToNext();
              }, 500);
            } else {
              proceedToNext();
            }
          }
        },
      });
    }

    typingAnimation.startTyping(script.script);
  });

  const activateAudioContext = () => {
    if (audioContextActivated()) return;
    
    const emptyAudio = new Audio();
    emptyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    emptyAudio.volume = 0.01;
    emptyAudio.play().then(() => {
      emptyAudio.pause();
      setAudioContextActivated(true);
      setTimeout(() => {
        setCurrentScriptIndex(0);
      }, 100);
    }).catch(() => {
      setAudioContextActivated(true);
      setTimeout(() => {
        setCurrentScriptIndex(0);
      }, 100);
    });
  };

  onMount(async () => {
    const imageUrls = determineInfoConceptScripts.map(script => getS3ImageURL(script.maiPng));
    try {
      await preloadImages(imageUrls);
      setIsReady(true);
    } catch (error) {
      setIsReady(true);
    }

    const handleUserInteraction = () => {
      activateAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);
  });

  onCleanup(() => {
    cancelAutoProceed();
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div
        class={pageContainerStyles.container}
        style={{
          position: 'relative',
          'background-color': '#A9E0FF',
          'background-size': 'cover',
          'background-position': 'center',
          display: 'flex',
          'align-items': 'center',
          'flex-direction': 'column-reverse',
          padding: '1rem 2rem 1rem',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          'max-width': '800px',
          background: 'white',
          padding: '2rem',
          'border-radius': '16px',
          'box-shadow': '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <Show when={currentTitle()} fallback={<h1 style={{ 'font-size': '2rem', margin: '0 0 1rem 0' }}>정보 출처 판단</h1>}>
            <h1 style={{ 'font-size': '2rem', margin: '0 0 1rem 0' }}>{currentTitle()}</h1>
          </Show>
          <Show when={currentConcept()}>
            <div style={{ 
              display: 'flex', 
              'flex-direction': 'column', 
              gap: '0.5rem',
              padding: '1rem',
              background: '#f0f8ff',
              'border-radius': '8px',
            }}>
              <span style={{ 'font-weight': 'bold', 'font-size': '1.2rem' }}>개념</span>
              <span style={{ 'font-size': '1rem' }}>{currentConcept()}</span>
            </div>
          </Show>
          <div style={{ 
            position: 'relative',
            margin: '2rem 0',
            'min-height': '200px',
          }}>
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '60%',
            }}>
              <img
                src={characterImageUrl()}
                alt="MAI"
                style={{
                  width: '200px',
                  height: 'auto',
                }}
              />
            </div>
            <SpeechBubble message={typingAnimation.displayedMessage()} size={600} />
          </div>
          <Show when={isLastScript() && (typingAnimation.displayedMessage().length === currentScript()?.script.length || wasSkipped())}>
            <div style={{ display: 'flex', gap: '1rem', 'justify-content': 'center', margin: '2rem 0' }}>
              <button
                onClick={restartFromBeginning}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  'border-radius': '8px',
                  cursor: 'pointer',
                  'font-size': '1rem',
                }}
              >
                다시듣기
              </button>
              <button
                onClick={goToNextStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  'border-radius': '8px',
                  cursor: 'pointer',
                  'font-size': '1rem',
                }}
              >
                넘어가기
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default DetermineInfoConcept;
