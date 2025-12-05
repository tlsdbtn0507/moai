import { Show, createSignal } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { LoadingSpinner } from '../LoadingSpinner';
import pageContainerStyles from '../../styles/PageContainer.module.css';

const MakingOwnAiAssistant = () => {
  const [isReady, setIsReady] = createSignal(true);
  const navigate = useNavigate();
  const params = useParams();

  const goToNextStep = () => {
    const worldId = params.worldId || '4';
    const classId = params.classId || '3';
    const nextStepId = '5';
    navigate(`/${worldId}/${classId}/${nextStepId}`);
  };

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={pageContainerStyles.container}>
        <h1>MakingOwnAiAssistant - 실제 연습</h1>
        <p>이 페이지는 구현 중입니다.</p>
        <button onClick={goToNextStep}>다음 단계로</button>
      </div>
    </Show>
  );
};

export default MakingOwnAiAssistant;

