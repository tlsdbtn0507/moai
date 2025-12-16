import { createSignal, onMount, Show } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { DescribeModal } from './modal/DescribeModal';
import { CompareModal } from './modal/CompareModal';
import { LoadingModal } from './modal/LoadingModal';
import { LoadingSpinner } from '../LoadingSpinner';
import { generateImageFromPrompt } from '../../utils/gptImage';
import { useDescribeImageStore } from '../../store/1/3/describeImageStore';

const CompareImage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const backgroundImageStyle = getS3ImageURL('sunsetOfMoai.png');
  const backgroundImageStyleURL = `url(${backgroundImageStyle})`;

  const [isReady, setIsReady] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(true);
  const [selectedValue, setSelectedValue] = createSignal<'mt' | 'sea' | 'city' | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = createSignal<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = createSignal(false);

  // 최초 렌더 시 로컬스토리지에서 선택값 복원
  onMount(async () => {
    try {
      await preloadImages([backgroundImageStyle]);
      setIsReady(true);
    } catch (error) {
      setIsReady(true);
    }

    const savedValue = localStorage.getItem('describeSelectedValue');
    if (savedValue === 'mt' || savedValue === 'sea' || savedValue === 'city') {
      setSelectedValue(savedValue);
      // zustand에도 반영하여 CompareModal에서 접근 가능하도록
      useDescribeImageStore.getState().setSelectedImage(savedValue);
    }

    const savedGeneratedUrl = localStorage.getItem('describeGeneratedImageUrl');
    if (savedGeneratedUrl) {
      setGeneratedImageUrl(savedGeneratedUrl);
      setIsModalOpen(false);
      setIsCompareModalOpen(true);
    }
  });

  const handleSubmit = async (description: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setGeneratedImageUrl(null);
    setIsModalOpen(false);
    setIsCompareModalOpen(false);
    try {
      const url = await generateImageFromPrompt(description);
      setGeneratedImageUrl(url);
      localStorage.setItem('describeGeneratedImageUrl', url);
      setIsCompareModalOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '이미지 생성에 실패했습니다.');
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      class={pageContainerStyles.container}
      style={{ 'background-image': backgroundImageStyleURL }}
      onClick={() => {
        localStorage.removeItem('describeSelectedValue');
        const worldId = params.worldId || '1';
        const classId = params.classId || '3';
        navigate(`/${worldId}/${classId}/1`);
      }}
    >
      <Show when={isReady()} fallback={<LoadingSpinner />}>
        <Show when={isModalOpen()}>
          <DescribeModal
            isOpen={isModalOpen()}
            onClose={() => {
              setIsModalOpen(false);
              const worldId = params.worldId || '1';
              const classId = params.classId || '3';
              navigate(`/${worldId}/${classId}/1`);
            }}
            selectedValue={selectedValue()}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting()}
            generatedImageUrl={generatedImageUrl()}
            errorMessage={errorMessage()}
          />
        </Show>
        <LoadingModal isOpen={isSubmitting()} />
        <Show when={generatedImageUrl()} keyed>
          {(url) => (
            <CompareModal
                isOpen={isCompareModalOpen()}
                onClose={() => setIsCompareModalOpen(false)}
                generatedImageUrl={url}
                onReset={() => {
                  setGeneratedImageUrl(null);
                  setErrorMessage(null);
                  setIsModalOpen(true);
                  setIsCompareModalOpen(false);
                  localStorage.removeItem('describeSelectedValue');
                }}
              />
          )}
        </Show>
      </Show>
    </div>
  );
};

export default CompareImage;
