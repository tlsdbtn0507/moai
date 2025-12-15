import { getS3ImageURL } from '../../utils/loading';
import { CompareAiAssistantSelectionInterface } from '../../data/scripts/4-2';
import styles from './CompareAiAssistants.module.css';
import { SpeechBubble } from '../SpeechBubble';
import { useSkipControls } from '../../utils/hooks/useSkipControls';
import { createSignal, createEffect, createMemo, Show } from 'solid-js';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';

type CompareAiAssistantSelectionFlowProps = {
  scripts: CompareAiAssistantSelectionInterface[];
  onAllComplete: () => void;
};

export function CompareAiAssistantSelectionFlow(props: CompareAiAssistantSelectionFlowProps) {
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [currentPlayingScriptIndex, setCurrentPlayingScriptIndex] = createSignal<number | null>(null);
  
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  const audioPlayback = useAudioPlayback();
  
  const currentScript = () => props.scripts[currentScriptIndex()];
  
  // 다음 스크립트로 진행
  const proceedToNext = () => {
    const nextIndex = currentScriptIndex() + 1;
    if (nextIndex < props.scripts.length) {
      typingAnimation.resetSkipState();
      setCurrentPlayingScriptIndex(null);
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
    } else {
      props.onAllComplete();
    }
  };
  
  // 이전 스크립트로 진행
  const proceedToPrev = () => {
    const prevIndex = currentScriptIndex() - 1;
    if (prevIndex >= 0) {
      typingAnimation.resetSkipState();
      setCurrentPlayingScriptIndex(null);
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(prevIndex);
      }, 10);
    }
  };
  
  // 스킵 컨트롤 훅
  useSkipControls({
    isTypingSkipped: typingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      const script = currentScript();
      if (script) {
        typingAnimation.skipTyping();
        typingAnimation.setDisplayedMessage(script.script);
      }
    },
    onSecondSkip: () => {
      audioPlayback.stopAudio();
    },
  });
  
  // 스크립트 변경 시 처리
  createEffect(() => {
    const scriptIndex = currentScriptIndex();
    const script = currentScript();
    if (!script) return;
    
    // 오디오 재생 로직 - 새로운 스크립트일 때만 재생
    const isNewScript = currentPlayingScriptIndex() !== scriptIndex;
    if (isNewScript) {
      setCurrentPlayingScriptIndex(scriptIndex);
      // 타이핑 상태 초기화 (새 스크립트 시작 전)
      typingAnimation.setDisplayedMessage('');
      typingAnimation.resetSkipState();
      
      // 오디오 재생
      audioPlayback.playAudio(script.voice, {
        onEnded: () => {
          // 자동 진행 제거 - 사용자가 버튼을 눌러야 함
        },
      });
      
      // 오디오 시작과 동시에 타이핑 애니메이션 시작
      typingAnimation.startTyping(script.script);
    }
  });
  
  // 마지막 스크립트인지 확인
  const isLastScript = createMemo(() => {
    return currentScriptIndex() >= props.scripts.length - 1;
  });

  // 완료 여부 확인
  const isComplete = createMemo(() => {
    const script = currentScript();
    if (!script) return false;
    const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
    const isAudioComplete = !audioPlayback.isPlaying();
    
    if (typingAnimation.isTypingSkipped()) {
      return isTypingComplete;
    }
    return isTypingComplete && isAudioComplete;
  });

  return (
    <div
      class={styles.selectionFlowContainer}
      style={{ 'background-image': `url(${getS3ImageURL(currentScript()?.bgPng || '')})` }}
    >
      <div class={styles.selectionFlowContent}>
        <img
          src={getS3ImageURL(currentScript()?.maiPng || '')}
          alt="mai"
          class={styles.selectionFlowMai}
        />
        <SpeechBubble
          message={typingAnimation.displayedMessage()}
          size={800}
          showNavigation={true}
          onNext={proceedToNext}
          onPrev={proceedToPrev}
          isComplete={() => {
            const script = currentScript();
            if (!script) return false;
            const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
            const isAudioComplete = !audioPlayback.isPlaying();
            if (typingAnimation.isTypingSkipped()) {
              return isTypingComplete;
            }
            return isTypingComplete && isAudioComplete;
          }}
          canGoNext={() => {
            // 마지막 스크립트일 때는 다음 버튼 숨김
            if (isLastScript()) return false;
            const script = currentScript();
            if (!script) return false;
            const isTypingComplete = typingAnimation.displayedMessage().length === script.script.length || typingAnimation.isTypingSkipped();
            const isAudioComplete = !audioPlayback.isPlaying();
            const isComplete = typingAnimation.isTypingSkipped() 
              ? isTypingComplete 
              : (isTypingComplete && isAudioComplete);
            return isComplete;
          }}
          canGoPrev={() => currentScriptIndex() > 0}
        />
        <Show when={isLastScript() && isComplete()}>
          <div class={styles.nextButtonContainer}>
            <button
              onClick={props.onAllComplete}
              class={styles.nextButton}
            >
              넘어가기
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
