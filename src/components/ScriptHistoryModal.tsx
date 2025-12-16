import { Show, For, createEffect, onMount } from 'solid-js';
import styles from './ScriptHistoryModal.module.css';

type ScriptItem = {
  id: number;
  script: string;
  characterName?: string; // 캐릭터 이름 (선택사항)
};

type ScriptHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  scripts: ScriptItem[];
  currentIndex: number;
};

export function ScriptHistoryModal(props: ScriptHistoryModalProps) {
  let scrollContainerRef: HTMLDivElement | undefined;
  let activeItemRef: HTMLDivElement | undefined;

  // 모달이 열릴 때 현재 대사로 스크롤
  createEffect(() => {
    if (props.isOpen && activeItemRef && scrollContainerRef) {
      // 약간의 딜레이를 주어 DOM이 완전히 렌더링된 후 스크롤
      setTimeout(() => {
        if (activeItemRef && scrollContainerRef) {
          const containerRect = scrollContainerRef.getBoundingClientRect();
          const itemRect = activeItemRef.getBoundingClientRect();
          const scrollTop = scrollContainerRef.scrollTop;
          const itemTop = itemRect.top - containerRect.top + scrollTop;
          const containerHeight = scrollContainerRef.clientHeight;
          const itemHeight = itemRect.height;
          
          // 현재 아이템을 컨테이너 중앙에 위치시키기
          scrollContainerRef.scrollTo({
            top: itemTop - (containerHeight / 2) + (itemHeight / 2),
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  });

  // ESC 키로 모달 닫기
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.isOpen) {
        props.onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <Show when={props.isOpen}>
      <div class={styles.overlay} onClick={props.onClose}>
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div class={styles.header}>
            <div class={styles.handle}></div>
            <button class={styles.closeButton} onClick={props.onClose}>
              ✕
            </button>
          </div>
          <div class={styles.content} ref={scrollContainerRef}>
            <For each={props.scripts}>
              {(script, index) => {
                const isCurrent = index() === props.currentIndex;
                const isPast = index() < props.currentIndex;
                
                return (
                  <div
                    ref={isCurrent ? activeItemRef : undefined}
                    class={`${styles.scriptItem} ${
                      isCurrent 
                        ? styles.current 
                        : styles.past
                    }`}
                  >
                    {script.characterName && (
                      <div class={styles.characterName}>{script.characterName}:</div>
                    )}
                    <div
                      class={styles.scriptText}
                      innerHTML={script.script}
                    />
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}
