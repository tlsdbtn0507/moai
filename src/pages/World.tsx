import { A, useParams } from '@solidjs/router';
import { Show, createSignal, onMount } from 'solid-js';
import { ClassGuideCard } from '../components/ClassGuideCard';
import { WorldMapDropdown } from '../components/WorldMapDropdown';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { LoadingSpinner } from '../components/LoadingSpinner';
import pageContainerStyles from '../styles/PageContainer.module.css';
import styles from './World.module.css';
import { 
  type ClassVariant, 
  type ClassConfig, 
  WORLD_1_CLASS_CONFIGS, 
  WORLD_2_CLASS_CONFIGS,
  WORLD_4_CLASS_CONFIGS 
} from './worldClassConfigs';

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

  const classConfigs = (): ClassConfig[] => {
    if (worldId() === '2') {
      return WORLD_2_CLASS_CONFIGS;
    }
    if (worldId() === '4') {
      return WORLD_4_CLASS_CONFIGS;
    }
    return WORLD_1_CLASS_CONFIGS;
  };

  const guideContent = (classId?: number) => {
    if (worldId() === '2') {
      if (classId === 2) {
        return {
          heading: 'AI의 정보출처 판단하기',
          description:
            'AI가 제공하는 정보의 출처를 판단하고 신뢰성을 평가하여 정확한 정보를 활용할 수 있다.',
          lockedDescription: '선행 차시를 완료하고 진행해주세요.',
        };
      }
      if (classId === 7) {
        return {
          heading: 'AI의 정보출처 판단하기',
          description:
            'AI가 제시한 정보의 출처와 신뢰성을 판단하여, 사실에 기반한 답을 스스로 검증할 수 있다.',
          lockedDescription: '선행 차시를 완료하고 진행해주세요.',
        };
      }
      return {
        heading: 'AI의 정보출처 판단하기',
        description:
          'AI가 제공하는 정보의 출처를 판단하고 신뢰성을 평가하여 정확한 정보를 활용할 수 있다.',
        lockedDescription: '선행 차시를 완료하고 진행해주세요.',
      };
    }
    if (worldId() === '4') {
      if (classId === 1) {
        return {
          heading: 'AI비서 만들기 입문',
          description:
            'AI 비서의 핵심 기능을 설계하고 활용 방법을 익혀 실전에서 효과적으로 AI를 활용할 수 있다.',
          lockedDescription: '선행 차시를 완료하고 진행해주세요.',
        };
      }
      return {
        heading: '나만의 AI비서 설계',
        description:
          'AI 비서의 핵심 기능을 설계하고 활용 방법을 익혀 실전에서 효과적으로 AI를 활용할 수 있다.',
        lockedDescription: '선행 차시를 완료하고 진행해주세요.',
      };
    }
    return {
      heading: '프롬프트팅의 중요성',
      description:
        '인공지능에게 문제 해결을 위한 명확한 명령을 구성하여 상황에 맞게 효과적인 질문과 지시를 할 수 있다.',
      lockedDescription: '선행 차시를 완료하고 진행해주세요.',
    };
  };

  const activeClass = () => classConfigs().find((config) => config.id === activeClassId());

  const handleClassClick = (event: MouseEvent, classId: number) => {
    event.preventDefault();
    // 월드 4에서 클래스 3 이상은 경고만 표시하고 링크 비활성화
    if (worldId() === '4' && classId >= 3) {
      setActiveClassId(classId);
      return;
    }
    // 월드 2에서 클래스 2와 7만 활성화
    if (worldId() === '2' && classId !== 2 && classId !== 7) {
      setActiveClassId(classId);
      return;
    }
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
        {classConfigs().map((classConfig) => {
          const isLockedInWorld = worldId() === '4' ? classConfig.id >= 3 : worldId() === '2' ? classConfig.id !== 2 && classConfig.id !== 7 : classConfig.id > 2;
          
          // 월드 2의 버튼 스타일 적용
          let buttonStyle: Record<string, string> = { top: classConfig.position.top, left: classConfig.position.left };
          if (worldId() === '2') {
            if (classConfig.id <= 6) {
              // 차시 1-6은 파란색
              buttonStyle.background = 'radial-gradient(circle at 40% 30%, #a8dbff, #58b8ff)';
              buttonStyle['border-color'] = '#2d8be8';
            } else if (classConfig.id === 7) {
              // 차시 7은 초록색
              buttonStyle.background = 'radial-gradient(circle at 40% 30%, #9ef4c2, #38c172)';
              buttonStyle['border-color'] = '#1f8a4d';
            } else if (classConfig.id === 8) {
              // 차시 8은 회색
              buttonStyle.background = 'radial-gradient(circle at 40% 30%, #d9d9d9, #9b9b9b)';
              buttonStyle['border-color'] = '#6d6d6d';
            }
          }
          
          return (
            <A
              href={isLockedInWorld ? '#' : `/${worldId()}/${classConfig.id}`}
              class={`${styles.classButton} ${worldId() !== '2' ? buttonVariantClass(classConfig.variant) : ''}`}
              style={buttonStyle}
              onClick={(event) => handleClassClick(event, classConfig.id)}
            >
              {classConfig.id}
            </A>
          );
        })}

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
                  heading={isLockedClass() ? '선행 차시를 완료하세요.' : guideContent(selected().id).heading}
                  description={isLockedClass() ? guideContent(selected().id).lockedDescription : guideContent(selected().id).description}
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

