import { Show, createSignal } from 'solid-js';
import { getS3ImageURL } from '../../utils/loading';
import { type PromptScores } from '../../utils/gptChat';
import { LoadingSpinner } from '../LoadingSpinner';
import styles from './ScoreBoard.module.css';

type ScoreBoardProps = {
  scores: PromptScores | null;
  onWorldMap?: () => void;
  onSummary?: () => void;
  onNextLesson?: () => void;
};

export function ScoreBoard(props: ScoreBoardProps) {
  const scoreBoardImageStyle = getS3ImageURL('1-3/backgrounnd.png');
  const scoreBoardImageStyleURL = `url(${scoreBoardImageStyle})`;
  const reportRibbonImageStyle = getS3ImageURL('1-3/reportRebbon.png');
  const [showFeedback, setShowFeedback] = createSignal(false);

  return (
    <div class={styles.scoreBoard} style={{ 'background-image': scoreBoardImageStyleURL }}>
      <div class={styles.scoreHeader}>
        <img class={styles.ribbon} src={reportRibbonImageStyle} alt="스코어 헤더 리본" />
      </div>
      <div class={styles.scoreContent}>
        <Show 
          when={props.scores}
          fallback={
            <div class={styles.loadingContainer}>
              <LoadingSpinner size="medium" />
              <p class={styles.loadingText}>피드백 하는 중...</p>
            </div>
          }
        >
          {(score) => (
            <Show
              when={!showFeedback()}
              fallback={
                <div class={styles.feedbackContent}>
                  <div class={styles.feedbackSection}>
                    <div class={styles.feedbackLabel}>
                      <span class={styles.feedbackLabelText}>구체성</span>
                    </div>
                    <div class={styles.feedbackText}>
                      {score().feedback.specificity}
                    </div>
                  </div>
                  {/* <div class={styles.feedbackDivider}></div> */}
                  <div class={styles.feedbackSection}>
                    <div class={styles.feedbackLabel}>
                      <span class={styles.feedbackLabelText}>명확성</span>
                    </div>
                    <div class={styles.feedbackText}>
                      {score().feedback.clarity}
                    </div>
                  </div>
                  {/* <div class={styles.feedbackDivider}></div> */}
                  <div class={styles.feedbackSection}>
                    <div class={styles.feedbackLabel}>
                      <span class={styles.feedbackLabelText}>맥락성</span>
                    </div>
                    <div class={styles.feedbackText}>
                      {score().feedback.contextuality}
                    </div>
                  </div>
                </div>
              }
            >
              <>
                <div class={styles.scoreRow}>
                  <img src={getS3ImageURL(`1-3/star${score().specificity}.png`)} alt="구체성 별점" />
                  <div class={styles.scoreTitle}>
                    <span class={styles.scoreTitleText}>구체성</span>
                  </div>
                </div>
                <div class={styles.scoreRow}>
                  <img src={getS3ImageURL(`1-3/star${score().clarity}.png`)} alt="명확성 별점" />
                  <div class={styles.scoreTitle}>
                    <span class={styles.scoreTitleText}>명확성</span>
                  </div>
                </div>
                <div class={styles.scoreRow}>
                  <img src={getS3ImageURL(`1-3/star${score().contextuality}.png`)} alt="맥락성 별점" />
                  <div class={styles.scoreTitle}>
                    <span class={styles.scoreTitleText}>맥락성</span>
                  </div>
                </div>
              </>
            </Show>
          )}
        </Show>
      </div>
      <div class={styles.buttonWrapper}>
        <Show when={!showFeedback()}>
          <button
            class={styles.sideBtn}
            onClick={props.onWorldMap}
            disabled={!props.scores}
          >
            월드맵
          </button>
        </Show>
        <button
          class={styles.centerBtn}
          onClick={() => {
            setShowFeedback(!showFeedback());
            if (props.onSummary) props.onSummary();
          }}
          disabled={!props.scores}
        >
          { showFeedback() ? '돌아가기' : '학습요약' }
        </button>
        <Show when={!showFeedback()}>
          <button
            class={styles.sideBtn}
            onClick={props.onNextLesson}
            disabled={!props.scores}
          >
            다음 학습하기
          </button>
        </Show>
      </div>
    </div>
  );
}

