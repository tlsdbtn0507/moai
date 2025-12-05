import { A } from '@solidjs/router';
import { createSignal, onMount, Show } from 'solid-js';
import { getS3ImageURL, preloadImages } from '../utils/loading';
import { setBodyBackgroundFromImage } from '../utils/colorExtractor';
import { LoadingSpinner } from '../components/LoadingSpinner';
import styles from './Home.module.css';
import pageContainerStyles from '../styles/PageContainer.module.css';

export function Home() {
  const [isReady, setIsReady] = createSignal(false);

  const backgroundImageStyle = getS3ImageURL('moaiRootBg.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;
  const logoImageStyle = getS3ImageURL('moaiLogo.png');

  // 배경 이미지에서 색상을 추출하여 body 배경색 설정
  onMount(async () => {
    try {
      await preloadImages([backgroundImageStyle, logoImageStyle]);
      setIsReady(true);
      setBodyBackgroundFromImage(backgroundImageStyle);
    } catch (error) {
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div 
        class={pageContainerStyles.container}
        style={{ 'background-image': backgroundImageStyleURL }}
      >
        <img src={logoImageStyle} alt="Moai Logo" class={styles.logo} />

        <nav class={styles.nav}>
          <A href="/worldmap" class={styles.linkButton}>
            월드맵으로 이동
          </A>
        </nav>
      </div>
    </Show>
  );
}

