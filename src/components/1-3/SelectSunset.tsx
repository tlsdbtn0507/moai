import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import styles from './SelectSunset.module.css';

type SelectSunsetProps = {
  onSelect: (value: 'mt' | 'sea' | 'city') => void;
};

const options = [
  { text: '울창한 숲 사이의 노을이었어', value: 'mt' as const },
  { text: '광활한 바다 위에 떠있었어', value: 'sea' as const },
  { text: '빌딩들 사이에 떠있었어', value: 'city' as const },
];

export function SelectSunset(props: SelectSunsetProps) {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation(); // 전역 스킵 핸들러로 이벤트가 전달되지 않도록 차단
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation(); // 엔터 입력이 스킵 컨트롤까지 가지 않도록 차단
      handleSelect(selectedIndex());
    }
  };

  const handleSelect = (index: number) => {
    const selectedOption = options[index];
    props.onSelect(selectedOption.value);
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={styles.container}>
      {options.map((option, index) => (
        <div
          class={styles.option}
          classList={{ [styles.selected]: selectedIndex() === index }}
          onClick={() => handleSelect(index)}
        >
          <Show when={selectedIndex() === index}>
            <span class={styles.arrow}>▶</span>
          </Show>
          <span class={styles.text}>{option.text}</span>
        </div>
      ))}
    </div>
  );
}

