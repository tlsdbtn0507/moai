import { Show } from 'solid-js';
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
          )}
        </Show>
      </div>
      <div class={styles.buttonWrapper}>
        <button class={styles.sideBtn} onClick={props.onWorldMap}>월드맵</button>
        <button class={styles.centerBtn} onClick={props.onSummary}>학습요약</button>
        <button class={styles.sideBtn} onClick={props.onNextLesson}>다음 학습하기</button>
      </div>
    </div>
  );
}

