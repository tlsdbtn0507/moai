import { A, useParams, useNavigate } from '@solidjs/router';
import { createSignal, onMount, Show, type JSX } from 'solid-js';
import { WORLD_DETAILS, type WorldDetail } from '../constants/worldDetails';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { LoadingSpinner } from '../components/LoadingSpinner';
import pageContainerStyles from '../styles/PageContainer.module.css';
import styles from '../styles/WorldMap.module.css';

const shadeColor = (hex: string, percent: number) => {
  const normalizedHex = hex.replace('#', '');
  const num = parseInt(normalizedHex, 16);
  const target = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = num >> 16;
  const G = (num >> 8) & 0x00ff;
  const B = num & 0x0000ff;
  const newR = Math.round((target - R) * p) + R;
  const newG = Math.round((target - G) * p) + G;
  const newB = Math.round((target - B) * p) + B;
  return (
    '#' +
    (
      (1 << 24) +
      (newR << 16) +
      (newG << 8) +
      newB
    )
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
};

export function WorldMap() {
  const params = useParams();
  const navigate = useNavigate();
  const [selectedWorldMap, setSelectedWorldMap] = createSignal(1);
  const [warningWorld, setWarningWorld] = createSignal<WorldDetail | null>(null);
  const [isReady, setIsReady] = createSignal(false);

  const backgroundImageStyle = getS3ImageURL('moaiRootBg.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;
  const lockImage = getS3ImageURL('lock.png');
  const warningImage = getS3ImageURL('warning.png');
  const closeWarningModal = () => setWarningWorld(null);
  
  const handleAdvanceStudy = () => {
    const world = warningWorld();
    if (world) {
      navigate(`/${world.id}`);
    }
  };

  // URL 파라미터에서 월드맵 ID 읽기
  onMount(async () => {
    const worldMapId = params.worldMapId ? parseInt(params.worldMapId, 10) : 1;
    if (worldMapId >= 1 && worldMapId <= 4) {
      setSelectedWorldMap(worldMapId);
    }

    // 모든 이미지 URL 수집
    const imageUrls = [
      backgroundImageStyle,
      lockImage,
      warningImage,
      ...WORLD_DETAILS.map((world) => world.image),
    ];

    try {
      await preloadImages(imageUrls);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={pageContainerStyles.container} style={{ 
        'background-image': backgroundImageStyleURL, 
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        }}>
     <p style={{
      'font-size': '4rem',
      'font-weight': 'bold',
      color: '#064C5C',
     }}>학습할 단계를 선택하세요!</p>
     <div class={styles.worldsWrapper}>
        {WORLD_DETAILS.map((world) => {
          const lightFill = shadeColor(world.color.main, 30);
          const isLocked = world.id !== 1;
          const cardStyleVars = {
            '--world-main': `#${world.color.main}`,
            '--world-border': `#${world.color.border}`,
            '--world-light': lightFill,
          } as JSX.CSSProperties;
          const handleCardClick = () => {
            if (isLocked) {
              setWarningWorld(world);
            }
          };
          const handleCardKeyDown = (event: KeyboardEvent) => {
            if (!isLocked) {
              return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setWarningWorld(world);
            }
          };
          return (
            <div
              class={styles.worldCard}
              classList={{ [styles.lockedCard]: isLocked }}
              style={cardStyleVars}
              onClick={handleCardClick}
              tabIndex={isLocked ? 0 : undefined}
              role={isLocked ? 'button' : undefined}
              onKeyDown={handleCardKeyDown}
            >
              <p class={styles.worldName}>{world.worldName}</p>
              <img
                class={styles.worldImage}
                src={world.image}
                alt={world.worldName}
              />
              <span class={styles.worldDescription}>{world.description}</span>
              <A
                class={styles.enterButton}
                href={`/${world.id}`}
                tabIndex={isLocked ? -1 : 0}
                aria-disabled={isLocked}
              >
                입장하기
              </A>
              {isLocked && (
                <div
                  class={styles.lockOverlay}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCardClick();
                  }}
                >
                  <img class={styles.lockIcon} src={lockImage} alt="잠금됨" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {warningWorld() && (
        <div class={styles.modalBackdrop} onClick={closeWarningModal}>
          <div
            class={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              class={styles.warningImage}
              src={warningImage}
              alt="경고"
            />
            <p class={styles.modalMessage}>
              선행학습을 진행하지 않고 예습을 하면 이용에 지장이 생길 수
              있습니다. 정말 예습을 하실건가요?
            </p>
            <div class={styles.modalButtons}>
              <button 
                class={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                onClick={handleAdvanceStudy}
              >
                예습할래
              </button>
              <button
                class={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                onClick={closeWarningModal}
              >
                돌아갈래
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Show>
  );
}

