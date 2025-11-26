import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import styles from './ClassGuideCard.module.css';
import { getS3ImageURL } from '../utils/loading';

type ClassGuideCardProps = {
  chapterLabel: string;
  heading: string;
  description: string;
  actionHref: string;
  onClose: () => void;
};

export function ClassGuideCard(props: ClassGuideCardProps) {
  const isActionEnabled = () => /\/3$/.test(props.actionHref);
  const illustrationImageStyle = getS3ImageURL('sunsetOfMoai.png');
  const nonIllustrationImageStyle = getS3ImageURL('warningMai.png');
  const illustrationImageStyleURL = `url(${illustrationImageStyle})`;
  const nonIllustrationImageStyleURL = `url(${nonIllustrationImageStyle})`;

  

//   const descriptionText = props.description === '선행 차시를 완료하고 진행해주세요.' ? '선행 차시를 완료하고 진행해주세요.' : props.description;

  return (
    <div class={styles.card}>
        <h3 class={styles.heading}>{props.heading}</h3>

      <div class={styles.body}>
      <div class={styles.illustration}
      style={{
        'background-image': Number(props.actionHref.split('/').pop()) <= 3 ? illustrationImageStyleURL : nonIllustrationImageStyleURL,
      }}
      aria-hidden="true" />
        {/* <p class={styles.chapterLabel}>{props.chapterLabel}</p> */}
        <p class={styles.description}>{props.description}</p>

        <div class={styles.actions}>
          <button type="button" class={styles.secondary} onClick={props.onClose}>
            돌아가기
          </button>
          <Show
            when={isActionEnabled()}
            fallback={
              <button type="button" class={`${styles.primary} ${styles.disabled}`} disabled>
                학습하기
              </button>
            }
          >
            <A href={`${props.actionHref}/1`} class={styles.primary}>
              학습하기
            </A>
          </Show>
        </div>
      </div>
    </div>
  );
}


