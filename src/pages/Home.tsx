import { A } from '@solidjs/router';
import { onMount } from 'solid-js';
import { getS3ImageURL } from '../utils/loading';
import { setBodyBackgroundFromImage } from '../utils/colorExtractor';
import styles from './Home.module.css';
import pageContainerStyles from '../styles/PageContainer.module.css';

export function Home() {

  const backgroundImageStyle = getS3ImageURL('moaiRootBg.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;
  const logoImageStyle = getS3ImageURL('moaiLogo.png');

  // 배경 이미지에서 색상을 추출하여 body 배경색 설정
  onMount(() => {
    setBodyBackgroundFromImage(backgroundImageStyle);
  });

  return (
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
  );
}

