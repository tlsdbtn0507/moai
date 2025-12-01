import { createSignal, Accessor, Setter, onCleanup } from 'solid-js';

export interface UseTypingAnimationOptions {
  typingSpeed?: number; // ms per character
  onComplete?: () => void;
}

export interface UseTypingAnimationReturn {
  displayedMessage: Accessor<string>;
  setDisplayedMessage: Setter<string>;
  startTyping: (message: string) => void;
  skipTyping: () => void;
  isTypingSkipped: Accessor<boolean>;
  resetSkipState: () => void;
}

/**
 * 타이핑 애니메이션을 관리하는 커스텀 훅
 */
export function useTypingAnimation(
  options: UseTypingAnimationOptions = {}
): UseTypingAnimationReturn {
  const { typingSpeed = 150, onComplete } = options;
  
  const [displayedMessage, setDisplayedMessage] = createSignal('');
  const [isTypingSkipped, setIsTypingSkipped] = createSignal(false);
  
  let typingInterval: ReturnType<typeof setInterval> | null = null;

  const startTyping = (message: string) => {
    // 기존 타이핑 인터벌 정리
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    
    // 스킵 상태가 활성화되어 있으면 즉시 전체 텍스트 표시
    if (isTypingSkipped()) {
      setDisplayedMessage(message);
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    let typingIndex = 0;
    setDisplayedMessage('');
    
    typingInterval = setInterval(() => {
      if (typingIndex < message.length) {
        setDisplayedMessage(message.slice(0, typingIndex + 1));
        typingIndex++;
      } else {
        if (typingInterval) {
          clearInterval(typingInterval);
          typingInterval = null;
        }
        if (onComplete) {
          onComplete();
        }
      }
    }, typingSpeed);
  };

  const skipTyping = () => {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    setIsTypingSkipped(true);
  };

  const resetSkipState = () => {
    setIsTypingSkipped(false);
  };

  onCleanup(() => {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
  });

  return {
    displayedMessage,
    setDisplayedMessage,
    startTyping,
    skipTyping,
    isTypingSkipped,
    resetSkipState,
  };
}

