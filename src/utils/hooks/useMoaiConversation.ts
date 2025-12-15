import { createSignal, createEffect, createMemo, Accessor } from 'solid-js';
import { useTypingAnimation } from './useTypingAnimation';
import { useAudioPlayback } from './useAudioPlayback';
import { useSkipControls } from './useSkipControls';

/**
 * Moai 대화 기능에 필요한 스크립트 인터페이스
 * script와 voice 속성이 필수입니다.
 */
export interface MoaiConversationScript {
  script: string;
  voice: string;
  [key: string]: any; // 다른 속성들도 허용
}

export interface UseMoaiConversationOptions {
  typingSpeed?: number; // 타이핑 속도 (ms per character)
}

export interface UseMoaiConversationReturn<T extends MoaiConversationScript> {
  // 현재 스크립트 정보
  currentScript: Accessor<T | undefined>;
  currentScriptIndex: Accessor<number>;
  
  // 타이핑 애니메이션
  displayedMessage: Accessor<string>;
  
  // 네비게이션
  proceedToNext: () => void;
  proceedToPrev: () => void;
  
  // 상태 확인
  isLastScript: Accessor<boolean>;
  isComplete: Accessor<boolean>;
  
  // 오디오 재생 상태
  isAudioPlaying: Accessor<boolean>;
}

/**
 * Moai 대화 기능을 제공하는 커스텀 훅
 * 
 * 이 훅은 다음 기능들을 제공합니다:
 * - 타이핑 애니메이션
 * - 오디오 재생
 * - 스킵 컨트롤 (스페이스바)
 * - 스크립트 네비게이션 (이전/다음)
 * - 완료 상태 확인
 * 
 * @param scripts 대화 스크립트 배열
 * @param onAllComplete 모든 스크립트가 완료되었을 때 호출되는 콜백
 * @param options 옵션 설정
 * @returns Moai 대화 기능 관련 상태와 함수들
 */
export function useMoaiConversation<T extends MoaiConversationScript>(
  scripts: Accessor<T[]>,
  onAllComplete: () => void,
  options: UseMoaiConversationOptions = {}
): UseMoaiConversationReturn<T> {
  const { typingSpeed = 150 } = options;
  
  const [currentScriptIndex, setCurrentScriptIndex] = createSignal(0);
  const [currentPlayingScriptIndex, setCurrentPlayingScriptIndex] = createSignal<number | null>(null);
  
  const typingAnimation = useTypingAnimation({ typingSpeed });
  const audioPlayback = useAudioPlayback();
  
  const currentScript = (): T | undefined => {
    const index = currentScriptIndex();
    const scriptsArray = scripts();
    return scriptsArray[index];
  };
  
  // 다음 스크립트로 진행
  const proceedToNext = () => {
    const nextIndex = currentScriptIndex() + 1;
    const scriptsArray = scripts();
    if (nextIndex < scriptsArray.length) {
      typingAnimation.resetSkipState();
      setCurrentPlayingScriptIndex(null);
      audioPlayback.stopAudio();
      setTimeout(() => {
        setCurrentScriptIndex(nextIndex);
      }, 10);
    } else {
      onAllComplete();
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
    const scriptsArray = scripts();
    return currentScriptIndex() >= scriptsArray.length - 1;
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
  
  return {
    currentScript,
    currentScriptIndex,
    displayedMessage: typingAnimation.displayedMessage,
    proceedToNext,
    proceedToPrev,
    isLastScript,
    isComplete,
    isAudioPlaying: audioPlayback.isPlaying,
  };
}

