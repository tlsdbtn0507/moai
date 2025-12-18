import { createSignal, createMemo, Show, For } from 'solid-js';
import { getS3ImageURL } from '../../utils/loading';
import styles from './DetermineInfoPractice.module.css';

interface ConditionChecklistProps {
  onCorrect: () => void;
}

// 조건 목록 및 정답 정의
const CONDITION_ITEMS = [
  '기준 연도',
  '국적',
  '연령대',
  '구체적인 시간',
  '변화 추세',
  '출처',
];

const CORRECT_ANSWERS = ['국적', '변화 추세'];

export function ConditionChecklist(props: ConditionChecklistProps) {
  // 체크박스 상태 관리
  const [checkedConditions, setCheckedConditions] = createSignal<Record<string, boolean>>({});

  // 모달 상태 관리
  const [showAnswerModal, setShowAnswerModal] = createSignal(false);

  // 체크박스 상태 변경 핸들러
  const handleCheckboxChange = (condition: string, checked: boolean) => {
    setCheckedConditions((prev) => ({
      ...prev,
      [condition]: checked,
    }));
  };

  // 하나라도 체크되었는지 확인
  const hasAnyChecked = createMemo(() =>
    Object.values(checkedConditions()).some((checked) => checked),
  );

  // 정답 확인 로직
  const checkAnswer = () => {
    const checked = Object.keys(checkedConditions()).filter(
      (key) => checkedConditions()[key],
    );

    const isCorrect =
      checked.length === CORRECT_ANSWERS.length &&
      CORRECT_ANSWERS.every((answer) => checked.includes(answer)) &&
      checked.every((condition) => CORRECT_ANSWERS.includes(condition));

    if (isCorrect) {
      props.onCorrect();
    } else {
      setShowAnswerModal(true);
    }
  };

  // 다시 풀기 (모달 닫고 체크박스 초기화)
  const handleRetry = () => {
    setShowAnswerModal(false);
    setCheckedConditions({});
  };

  return (
    <div class={styles.conditionBox}>
      <Show when={!showAnswerModal()}>
        <p class={styles.conditionBoxTitle}>
          AI가 반영한 조건을 모두 클릭하여
          <br />
          빠진 조건을 확인해보세요
        </p>
        <hr class={styles.conditionBoxDivider} />
        <div class={styles.conditionList}>
          <For each={CONDITION_ITEMS}>
            {(condition) => (
              <label class={styles.conditionItem}>
                <input
                  type="checkbox"
                  checked={checkedConditions()[condition] || false}
                  onChange={(e) => handleCheckboxChange(condition, e.currentTarget.checked)}
                />
                <span>{condition}</span>
              </label>
            )}
          </For>
        </div>
        <div class={styles.conditionButtonWrapper}>
          <button
            class={styles.conditionButton}
            disabled={!hasAnyChecked()}
            onClick={checkAnswer}
          >
            정답 확인하기
          </button>
        </div>
      </Show>
      <Show when={showAnswerModal()}>
        <div class={styles.answerModal}>
          <img
            src={getS3ImageURL('2-7/magnifyingMaiR.png')}
            alt="MAI"
            class={styles.modalMaiImage}
          />
          <p class={styles.modalMessage}>앗! 다시 한 번 생각해볼까요?</p>
          <button class={styles.retryButton} onClick={handleRetry}>
            다시 풀기
          </button>
        </div>
      </Show>
    </div>
  );
}


