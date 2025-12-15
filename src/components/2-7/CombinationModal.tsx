import { getS3ImageURL } from '../../utils/loading';
import styles from './DetermineInfo.module.css';

type CombinationModalProps = {
  onNext: () => void;
};

const CombinationModal = (props: CombinationModalProps) => {
  const combinationImage = getS3ImageURL('2-7/combinationElement.png');


  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    props.onNext();
  };

  return (
    <div class={styles.intermediateComponent}>
      {/* 여기에 중간 컴포넌트 내용을 추가하세요 */}
      <div class={styles.intermediateContent}>
        <h1>단어를 조합하여 하나의 문장으로 만들어보자!</h1>
        <img src={combinationImage} alt="combination" />

        <form onSubmit={handleSubmit} class={styles.combinationForm}>
          <input type="text" 
          name="combination"
          class={styles.combinationInput}
          placeholder="다음 단어들을 조합하여 하나의 문장으로 만들어 보세요!" />
          <button
            type="submit"
            class={`${styles.combinationButton}`}
            >
            입력
          </button>
        </form>
      </div>
    </div>
  );
};

export default CombinationModal;

