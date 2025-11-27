import { A, useParams } from '@solidjs/router';
import { Show, createSignal, onMount } from 'solid-js';
import { ClassGuideCard } from '../components/ClassGuideCard';
import { WorldMapDropdown } from '../components/WorldMapDropdown';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { LoadingSpinner } from '../components/LoadingSpinner';
import pageContainerStyles from '../styles/PageContainer.module.css';
import styles from './World.module.css';

type ClassVariant = 'green' | 'gray';

export function World() {
  const params = useParams();
  const worldId = () => params.worldId;
  const [activeClassId, setActiveClassId] = createSignal<number | null>(null);
  const [isReady, setIsReady] = createSignal(false);

  const buttonVariantClass = (variant?: ClassVariant) => {
    if (variant === 'green') return styles.classButtonGreen;
    if (variant === 'gray') return styles.classButtonGray;
    return '';
  };

  const classConfigs: Array<{
    id: number;
    position: { top: string; left: string };
    guideOverride?: { top?: string; left?: string; transform?: string };
    variant?: ClassVariant;
  }> = [
    {
      id: 1,
      position: { top: '15%', left: '53%' },
      guideOverride: { top: '33%', left: '60%' },
    },
    { id: 2, position: { top: '30%', left: '35%' } },
    {
      id: 3,
      position: { top: '37%', left: '53%' },
      guideOverride: { top: '33%', left: '60%' },
      variant: 'green',
    },
    {
      id: 4,
      position: { top: '55%', left: '54%' },
      guideOverride: { top: '50%', left: '61%' },
      variant: 'gray',
    },
    {
      id: 5,
      position: { top: '60%', left: '38%' },
      guideOverride: {
        top: '57%',
        left: '40%',
      },
      variant: 'gray',
    },
    {
      id: 6,
      position: { top: '56%', left: '18%' },
      guideOverride: { 
        top: '56%', 
        left: '57%', 
        transform: 'translate(calc(-100% - 32px), -20%)', // 필요 시 원하는 값으로 조정

      },
      variant: 'gray',
    },
    {
      id: 7,
      position: { top: '75%', left: '25%' },
      guideOverride: { 
        top: '56%', 
        left: '64%',
        transform: 'translate(calc(-100% - 32px), -20%)',
       },
      variant: 'gray',
    },
    {
      id: 8,
      position: { top: '83%', left: '46%' },
      guideOverride: {
        top: '50%',
        left: '16%',
        transform: 'translate(16px, -20%)',
      },
      variant: 'gray',
    },
  ];

  const guideContent = {
    heading: '프롬프트팅의 중요성',
    description:
      '인공지능에게 문제 해결을 위한 명확한 명령을 구성하여 상황에 맞게 효과적인 질문과 지시를 할 수 있다.',
    lockedDescription: '선행 차시를 완료하고 진행해주세요.',
  };

  const activeClass = () => classConfigs.find((config) => config.id === activeClassId());

  const handleClassClick = (event: MouseEvent, classId: number) => {
    event.preventDefault();
    setActiveClassId((prev) => (prev === classId ? null : classId));
  };

  const closeGuide = () => setActiveClassId(null);

  const isLockedClass = () => activeClass()?.variant === 'gray';

  const guideTransform = () => {
    const selected = activeClass();
    if (!selected) return undefined;

    const cardLeft = selected.guideOverride?.left ?? selected.position.left;
    const leftPercent = parseFloat(cardLeft);
    if (selected.guideOverride?.transform) {
      return selected.guideOverride.transform;
    }
    if (leftPercent <= 22) return 'translate(16px, -20%)';
    if (leftPercent >= 78) return 'translate(calc(-100% - 16px), -20%)';
    if (leftPercent > 50) return 'translate(32px, -20%)';
    return 'translate(calc(-100% - 32px), -20%)';
  };

  const roadMapImageStyle = getS3ImageURL(`worldMapLv${worldId()}.png`);
  const roadMapImageStyleURL = `url(${roadMapImageStyle})`;

  onMount(async () => {
    try {
      await preloadImages([roadMapImageStyle]);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={`${pageContainerStyles.container} ${styles.container}`} style={{ 'background-image': roadMapImageStyleURL }}>
      <header class={styles.header}>
        <div class={styles.headerContent}>
          {/* <WorldMapDropdown /> */}
          <A href="/worldmap" class={styles.backButton}>
            월드맵으로 돌아가기
          </A>
        </div>
      </header>

      <div class={styles.classesContainer}>
        {classConfigs.map((classConfig) => (
          <A
            href={`/${worldId()}/${classConfig.id}`}
            class={`${styles.classButton} ${buttonVariantClass(classConfig.variant)}`}
            style={{ top: classConfig.position.top, left: classConfig.position.left }}
            onClick={(event) => handleClassClick(event, classConfig.id)}
          >
            {classConfig.id}
          </A>
        ))}

        <Show when={activeClass()}>
          {(selected) => (
            <>
              <button
                type="button"
                class={styles.guideBackdrop}
                aria-label="안내 창 닫기"
                onClick={closeGuide}
              />
              <div
                class={styles.guideCardWrapper}
                style={{
                  top: selected().guideOverride?.top ?? selected().position.top,
                  left: selected().guideOverride?.left ?? selected().position.left,
                  transform: guideTransform(),
                }}
              >
                <ClassGuideCard
                  chapterLabel={`월드 ${worldId()} · ${selected().id}차시`}
                  heading={isLockedClass() ? '선행 차시를 완료하세요.' : guideContent.heading}
                  description={isLockedClass() ? guideContent.lockedDescription : guideContent.description}


                  actionHref={`/${worldId()}/${selected().id}`}
                  onClose={closeGuide}
                />
              </div>
            </>
          )}
        </Show>
      </div>
      </div>
    </Show>
  );
}

