import { createSignal } from 'solid-js';
import { getS3ImageURL } from '../../utils/loading';
import styles from './SelectSunset.module.css';

type SelectSunsetProps = {
  onSelect: (value: 'mt' | 'sea' | 'city') => void;
};

const options = [
  { url:'sunsetOfMt.png', text: '울창한 숲 사이의\n노을이었어', value: 'mt' as const },
  { url:'sunsetOfSea.png', text: '광활한 바다 위에 떠있었어', value: 'sea' as const },
  { url:'sunsetOfCity.png', text: '빌딩들 사이에\n떠있었어', value: 'city' as const },
];

export function SelectSunset(props: SelectSunsetProps) {
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const handleSelect = (index: number) => {
    const selectedOption = options[index];
    props.onSelect(selectedOption.value);
  };

  return (
    <div class={styles.selectSunsetContainer}>
    <h2>Mai에게 묘사할 풍경을 골라보세요!</h2>
    <div class={styles.container}>
      {options.map((option, index) => (
        <div
          class={styles.option}
          onClick={() => {
            setSelectedIndex(index);
            handleSelect(index);
          }}>
          <img src={getS3ImageURL(option.url)} alt={option.text} style={{ 'width': '100%', 'height': '100%' ,"border-radius": "1rem"}} />
          <span class={styles.text}>{option.text}</span>
        </div>
      ))}
    </div>
    </div>
  );
}

