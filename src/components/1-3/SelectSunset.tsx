import { createSignal } from 'solid-js';
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

  const handleSelect = (index: number) => {
    const selectedOption = options[index];
    props.onSelect(selectedOption.value);
  };

  return (
    <div class={styles.container}>
      {options.map((option, index) => (
        <div
          class={styles.option}
          onClick={() => {
            setSelectedIndex(index);
            handleSelect(index);
          }}
        >
          <span class={styles.text}>{option.text}</span>
        </div>
      ))}
    </div>
  );
}

