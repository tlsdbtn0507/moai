import { getS3ImageURL } from '../../utils/loading';
import styles from './DetermineInfo.module.css';

type CombinationModalProps = {
  onNext: () => void;
  // 모달을 강제로 닫고 싶을 때 사용할 수 있는 선택적 콜백
  onClose?: () => void;
};

const CombinationModal = (props: CombinationModalProps) => {
  const combinationImage = getS3ImageURL('2-7/combinationElement.png');


  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    // 부모에서 전달한 흐름(스텝 진행)
    props.onNext();
    // 자동재생 여부와 상관없이 모달을 명시적으로 닫아준다
    if (props.onClose) {
      props.onClose();
    }
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

