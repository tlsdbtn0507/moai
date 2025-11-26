import { onMount, onCleanup } from 'solid-js';
import { setBodyBackgroundFromImage } from './colorExtractor';

/**
 * 배경 이미지에서 색상을 추출하여 body 배경색을 동적으로 설정하는 훅
 * @param imageUrl 배경 이미지 URL (선택사항)
 */
export function useBackgroundColor(imageUrl?: string) {
  onMount(() => {
    if (imageUrl) {
      setBodyBackgroundFromImage(imageUrl);
    }
  });

  // 컴포넌트가 언마운트될 때 기본 색상으로 복원 (선택사항)
  onCleanup(() => {
    // 필요시 기본 색상으로 복원하는 로직 추가 가능
  });
}

