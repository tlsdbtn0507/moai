import { useNavigate, useParams } from '@solidjs/router';
import { Show, createMemo, createSignal, For, createEffect } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import curriculum from '../data/curriculam.json';
import styles from './Step.module.css';
import DescribeImage from '../components/1-3/DescribeImage';
import CompareImage from '../components/1-3/CompareImage';
import ImportanceOfPrompting from '../components/1-3/ImportanceOfPrompting';
import MakingAvatarsWithPrompting from '../components/1-3/MakingAvatarsWithPrompting';
import AiFeedbackReview from '../components/1-3/AiFeedbackReview';
import IntroductionToAiAssistant from '../components/4-2/IntroductionToAiAssistant';
import CompareAiAssistants from '../components/4-2/CompareAiAssistants';
import LearningAiAssistant from '../components/4-2/LearningAiAssistant';
import MakingOwnAiAssistant from '../components/4-2/MakingOwnAiAssistant';
import FinishingUpq from '../components/4-2/FinishingUpq';
import DetermineInfo from '../components/2-7/DetermineInfo';
import DetermineInfoConcept from '../components/2-7/DetermineInfoConcept';
import DetermineInfoExploration from '../components/2-7/DetermineInfoExploration';
import DetermineInfoPractice from '../components/2-7/DetermineInfoPractice';
import DetermineInfoReview from '../components/2-7/DetermineInfoReview';

const componentRegistry = {
  DescribeImage,
  CompareImage,
  ImportanceOfPrompting,
  MakingAvatarsWithPrompting,
  AiFeedbackReview,
  IntroductionToAiAssistant,
  CompareAiAssistants,
  LearningAiAssistant,
  MakingOwnAiAssistant,
  FinishingUpq,
  DetermineInfo,
  DetermineInfoConcept,
  DetermineInfoExploration,
  DetermineInfoPractice,
  DetermineInfoReview,
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
      page: keyof typeof componentRegistry;
      title: string;
    }>;
  }>;
};

export function Step() {
  const params = useParams();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

  const matchedStep = createMemo(() => {
    const world = (curriculum.worlds as CurriculumWorld[]).find((w) => w.id === params.worldId);
    const clazz = world?.classes?.find((c) => c.id === params.classId);
    return clazz?.steps?.find((step) => step.id === params.stepId);
  });

  const stepsInClass = createMemo(() => {
    const world = (curriculum.worlds as CurriculumWorld[]).find((w) => w.id === params.worldId);
    const clazz = world?.classes?.find((c) => c.id === params.classId);
    return clazz?.steps ?? [];
  });

  // 현재 스텝 인덱스 (선행 스텝 이동 제한용)
  const currentStepIndex = createMemo(() => {
    const steps = stepsInClass();
    return steps.findIndex((step) => step.id === params.stepId);
  });

  const StepComponent = createMemo(() => {
    const componentName = matchedStep()?.page;
    return componentName ? componentRegistry[componentName] : undefined;
  });

  return (
    <div>
      <Show when={StepComponent()} fallback={<p>선택한 단계의 콘텐츠를 찾을 수 없습니다.</p>}>
          {(ActiveStep) => 
          <div class={styles.stepContainer}> 
            <Dynamic component={ActiveStep()} /> 
            <div class={styles.dropdownWrapper}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen())}
                class={styles.dropdownButton}
              >
                {matchedStep()?.title ?? '스텝 선택'}
                <span style={{ 'margin-left': '0.5rem' }}>▾</span>
              </button>
              <Show when={isDropdownOpen()}>
                <div class={styles.dropdownMenu}>
                  <Show when={stepsInClass().length > 0} fallback={<div class={styles.dropdownEmpty}>스텝 정보가 없습니다.</div>}>
                    <For each={stepsInClass()}>
                      {(step) => (
                        // 선행 스텝(현재보다 앞선 id)은 이동 불가
                        // params.stepId 기반으로 현재 인덱스 계산
                        // 현재/이후 스텝만 클릭 가능
                        (() => {
                          const targetIndex = stepsInClass().findIndex((s) => s.id === step.id);
                          const currentIndex = currentStepIndex();
                          // 이전 스텝은 이동 가능, 이후 스텝은 이동 불가
                          const isDisabled = targetIndex !== -1 && currentIndex !== -1 && targetIndex > currentIndex;
                          return (
                            <button
                              onClick={() => {
                                if (isDisabled) return;
                                setIsDropdownOpen(false);
                                navigate(`/${params.worldId}/${params.classId}/${step.id}`);
                              }}
                              disabled={isDisabled}
                              class={`${styles.dropdownItem} ${step.id === params.stepId ? styles.dropdownItemActive : ''} ${
                                isDisabled ? styles.dropdownItemDisabled : ''
                              }`}
                            >
                              {step.title}
                            </button>
                          );
                        })()
                      )}
                    </For>
                  </Show>
                </div>
              </Show>
            </div>
          </div>}
        </Show>
     </div>
  );
}

