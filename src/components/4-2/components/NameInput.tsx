import { createSignal } from 'solid-js';
import { getS3ImageURL } from '../../../utils/loading';
import styles from './NameInput.module.css';
import pageContainerStyles from '../../../styles/PageContainer.module.css';

interface NameInputProps {
  onNameSubmit: (name: string) => void;
}

const NameInput = (props: NameInputProps) => {
  const [name, setName] = createSignal('');

  const handleSubmit = () => {
    if (name().trim()) {
      props.onNameSubmit(name().trim());
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div class={`${pageContainerStyles.container} ${styles.container}`} 
         style={{"background-color": "#BCCAFF"}}>
      <div class={styles.contentWrapper}>
          <div class={styles.spanWrapper}>
            <span>실습: AI 비서 만들기</span>
          </div>
        <div class={styles.borderWrapper}>
          <img src={getS3ImageURL('4-2/completedAssistant.png')} class={styles.aiAssistantImage} />
          <div class={styles.inputSection}>
            <div class={styles.inputContainer}>
              <input
                type="text"
                class={styles.input}
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                onKeyPress={handleKeyPress}
                placeholder="AI 비서의 이름을 지어주세요!"
                />
              <button 
                class={styles.submitButton}
                onClick={handleSubmit}
                disabled={!name().trim()}
                >
                입력
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
  );
};

export default NameInput;