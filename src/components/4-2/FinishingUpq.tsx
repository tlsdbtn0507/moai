import { Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';

const FinishingUpq = () => {
  const [isReady, setIsReady] = createSignal(true);
  const navigate = useNavigate();
  const params = useParams();

  const goToNextStep = () => {
    // 마지막 단계이므로 월드맵으로 돌아가기
    navigate('/worldmap');
  };

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={pageContainerStyles.container}>
        <h1>FinishingUpq - 마무리 및 AI 분석</h1>
        <p>이 페이지는 구현 중입니다.</p>
        <button onClick={goToNextStep}>완료하기</button>
      </div>
    </Show>
  );
};

export default FinishingUpq;

