import { createSignal, Accessor, onCleanup } from 'solid-js';
import { useTypingAnimation } from './useTypingAnimation';
import { useAudioPlayback } from './useAudioPlayback';
import { useSkipControls } from './useSkipControls';

export interface ScriptLine {
  message: string;
  audioFile: string;
}

export interface UseScriptLineOptions {
  typingSpeed?: number;
  isActive?: Accessor<boolean>; // 스킵 기능이 활성화되어 있는지
  onComplete?: () => void; // 스크립트 라인 완료 시 호출 (음성 종료 또는 두 번째 스킵 시)
}

export interface UseScriptLineReturn {
  displayedMessage: Accessor<string>;
  isTyping: Accessor<boolean>;
  isAudioPlaying: Accessor<boolean>;
  isSkippedOnce: Accessor<boolean>;
  start: (scriptLine: ScriptLine) => void;
  reset: () => void;
}

/**
 * 스크립트 한 줄을 처리하는 커스텀 훅
 * - 타이핑 애니메이션과 오디오 재생을 동시에 시작
 * - 첫 번째 스킵: 애니메이션 즉시 종료, 음성은 계속 재생
 * - 두 번째 스킵: 음성 중단하고 다음으로 넘어감
 * - 음성 종료 시 애니메이션이 이미 종료되어 있었다면 자동으로 다음으로 넘어감
 */
export function useScriptLine(
  options: UseScriptLineOptions = {}
): UseScriptLineReturn {
  const { typingSpeed = 150, isActive, onComplete } = options;

  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed });
  
  // 오디오 재생 훅
  const audioPlayback = useAudioPlayback();

  // 상태 변수
  const [isTyping, setIsTyping] = createSignal(false);
  const [isSkippedOnce, setIsSkippedOnce] = createSignal(false);
  const [currentMessage, setCurrentMessage] = createSignal('');

  let typingInterval: ReturnType<typeof setInterval> | null = null;

  // 타이핑 애니메이션 시작 (내부 구현)
  const startTyping = (message: string) => {
    // 기존 타이핑 인터벌 정리
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }

    // 스킵 상태가 활성화되어 있으면 즉시 전체 텍스트 표시
    if (isSkippedOnce()) {
      typingAnimation.setDisplayedMessage(message);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let typingIndex = 0;
    typingAnimation.setDisplayedMessage('');

    typingInterval = setInterval(() => {
      if (typingIndex < message.length) {
        typingAnimation.setDisplayedMessage(message.slice(0, typingIndex + 1));
        typingIndex++;
      } else {
        if (typingInterval) {
          clearInterval(typingInterval);
          typingInterval = null;
        }
        setIsTyping(false);
        // 타이핑이 완료되었을 때, 음성이 이미 끝났다면 자동으로 다음으로 넘어감
        if (!audioPlayback.isPlaying() && onComplete) {
          onComplete();
        }
      }
    }, typingSpeed);
  };

  // 스크립트 라인 시작
  const start = (scriptLine: ScriptLine) => {
    const { message, audioFile } = scriptLine;
    
    // 상태 초기화
    setIsSkippedOnce(false);
    setCurrentMessage(message);

    // 타이핑 애니메이션 시작
    startTyping(message);

    // 오디오 재생 시작
    audioPlayback.playAudio(audioFile, {
      onEnded: () => {
        // 음성이 끝났을 때, 애니메이션이 이미 종료되어 있었다면 자동으로 다음으로 넘어감
        if (!isTyping()) {
          if (onComplete) {
            onComplete();
          }
        }
      },
    });
  };

  // 첫 번째 스킵: 애니메이션 즉시 종료, 음성은 계속 재생
  const handleFirstSkip = () => {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    setIsTyping(false);
    setIsSkippedOnce(true);
    // 전체 대사 즉시 출력
    typingAnimation.setDisplayedMessage(currentMessage());
  };

  // 두 번째 스킵: 음성 중단하고 다음으로 넘어감
  const handleSecondSkip = () => {
    audioPlayback.stopAudio();
    if (onComplete) {
      onComplete();
    }
  };

  // 스킵 컨트롤 훅
  useSkipControls({
    isActive,
    isTypingSkipped: isSkippedOnce,
    onFirstSkip: handleFirstSkip,
    onSecondSkip: handleSecondSkip,
  });

  // 리셋
  const reset = () => {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    setIsTyping(false);
    setIsSkippedOnce(false);
    setCurrentMessage('');
    typingAnimation.setDisplayedMessage('');
    typingAnimation.resetSkipState();
    audioPlayback.stopAudio();
  };

  onCleanup(() => {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
  });

  return {
    displayedMessage: typingAnimation.displayedMessage,
    isTyping,
    isAudioPlaying: () => audioPlayback.isPlaying(),
    isSkippedOnce,
    start,
    reset,
  };
}

