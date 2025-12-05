import { A } from '@solidjs/router';
import { Show, createSignal, onMount } from 'solid-js';
import styles from './ClassGuideCard.module.css';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { LoadingSpinner } from './LoadingSpinner';

type ClassGuideCardProps = {
  chapterLabel: string;
  heading: string;
  description: string;
  actionHref: string;
  onClose: () => void;
};

export function ClassGuideCard(props: ClassGuideCardProps) {
  const [isReady, setIsReady] = createSignal(false);
  
  // actionHref에서 월드와 클래스 정보 추출 (예: "/4/2")
  const pathParts = props.actionHref.split('/').filter(Boolean);
  const worldId = pathParts[0];
  const classId = pathParts[1] ? parseInt(pathParts[1], 10) : null;
  
  // 학습하기 버튼 활성화 조건: 클래스 3이거나 월드 4 클래스 2
  const isActionEnabled = () => {
    if (worldId === '4' && classId === 2) {
      return true;
    }
    return /\/3$/.test(props.actionHref);
  };
  
  // 학습하기 버튼 클릭 시 이동할 경로
  const getActionHref = () => {
    if (worldId === '4' && classId === 2) {
      return '/4/2/1';
    }
    return `${props.actionHref}/1`;
  };
  
  // 월드 4 클래스 1과 2인 경우 다른 이미지 사용
  const getIllustrationImage = () => {
    if (worldId === '4' && (classId === 1 || classId === 2)) {
      return getS3ImageURL('4-2/maiCity.png');
    }
    return getS3ImageURL('sunsetOfMoai.png');
  };
  
  const illustrationImageStyle = getIllustrationImage();
  const nonIllustrationImageStyle = getS3ImageURL('warningMai.png');
  const illustrationImageStyleURL = `url(${illustrationImageStyle})`;
  const nonIllustrationImageStyleURL = `url(${nonIllustrationImageStyle})`;

  onMount(async () => {
    try {
      await preloadImages([illustrationImageStyle, nonIllustrationImageStyle]);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });

//   const descriptionText = props.description === '선행 차시를 완료하고 진행해주세요.' ? '선행 차시를 완료하고 진행해주세요.' : props.description;

  return (
    <Show when={isReady()} fallback={
      <div class={styles.card} style={{ 'min-height': '200px', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
        <LoadingSpinner size="small" />
      </div>
    }>
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
            <A href={getActionHref()} class={styles.primary}>
              학습하기
            </A>
          </Show>
        </div>
      </div>
      </div>
    </Show>
  );
}


