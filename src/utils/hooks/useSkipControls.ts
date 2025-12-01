import { Accessor, onCleanup } from 'solid-js';

export interface UseSkipControlsOptions {
  isActive?: Accessor<boolean>; // 스킵 기능이 활성화되어 있는지 (예: 모달이 열려있는지)
  isTypingSkipped?: Accessor<boolean>; // 타이핑 스킵 상태 (useTypingAnimation에서 제공)
  onFirstSkip?: () => void; // 첫 번째 스킵 (타이핑 스킵)
  onSecondSkip?: () => void; // 두 번째 스킵 (음성 스킵)
}

/**
 * 키보드 스킵 기능을 관리하는 커스텀 훅
 * useTypingAnimation과 함께 사용하여 타이핑 애니메이션과 음성을 스킵할 수 있습니다.
 */
export function useSkipControls(
  options: UseSkipControlsOptions = {}
): void {
  const { isActive, isTypingSkipped, onFirstSkip, onSecondSkip } = options;

  const handleKeyDown = (event: KeyboardEvent) => {
    // 활성화 상태 확인
    if (isActive && !isActive()) return;
    
    // 스페이스바만 처리
    if (event.key !== ' ' && event.key !== 'Space') return;
    
    // 입력 필드에 포커스가 있으면 무시
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    event.preventDefault();
    
    // 첫 번째 키 입력: 대사 애니메이션 스킵
    const skipped = isTypingSkipped ? isTypingSkipped() : false;
    if (!skipped) {
      if (onFirstSkip) {
        onFirstSkip();
      }
    } else {
      // 두 번째 키 입력: 음성 생략하고 다음으로 넘어감
      if (onSecondSkip) {
        onSecondSkip();
      }
    }
  };

  // 키보드 이벤트 리스너 등록
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  }
}

