import { A, useParams } from '@solidjs/router';
import { Show, createMemo } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import pageContainerStyles from '../styles/PageContainer.module.css';
import curriculum from '../data/curriculam.json';
import DescribeImage from '../components/1-3/DescribeImage';
import CompareImage from '../components/1-3/CompareImage';
import ImportanceOfPrompting from '../components/1-3/ImportanceOfPrompting';
import MakingAvatarsWithPrompting from '../components/1-3/MakingAvatarsWithPrompting';
import AiFeedbackReview from '../components/1-3/AiFeedbackReview';

const componentRegistry = {
  DescribeImage,
  CompareImage,
  ImportanceOfPrompting,
  MakingAvatarsWithPrompting,
  AiFeedbackReview,
};

type CurriculumWorld = {
  id: string;
  name: string;
  classes?: Array<{
    id: string;
    title: string;
    steps?: Array<{
      id: string;
      type: string;
      component: keyof typeof componentRegistry;
      title: string;
    }>;
  }>;
};

export function Step() {
  const params = useParams();

  const matchedStep = createMemo(() => {
    const world = (curriculum.worlds as CurriculumWorld[]).find((w) => w.id === params.worldId);
    const clazz = world?.classes?.find((c) => c.id === params.classId);
    return clazz?.steps?.find((step) => step.id === params.stepId);
  });

  const StepComponent = createMemo(() => {
    const componentName = matchedStep()?.component;
    return componentName ? componentRegistry[componentName] : undefined;
  });

  return (
    <div>
      <div >
        <Show
          when={StepComponent()}
          fallback={<p>선택한 단계의 콘텐츠를 찾을 수 없습니다.</p>}
        >
          {(ActiveStep) => <Dynamic component={ActiveStep()} />}
        </Show>
      </div>

    </div>
  );
}

