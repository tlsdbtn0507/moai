import { Show, createSignal, onMount, createEffect } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { LoadingSpinner } from '../LoadingSpinner';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { compareStepScripts } from '../../data/scripts/4-2';
import CompareAiAssistantDetail from './CompareAiAssistantDetail';
import styles from './CompareAiAssistants.module.css';
import pageContainerStyles from '../../styles/PageContainer.module.css';

const CompareAiAssistants = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [selectedCardId, setSelectedCardId] = createSignal<number | null>(null);
  const navigate = useNavigate();
  const params = useParams();

  const backgroundImageUrl = getS3ImageURL('4-2/preBg.png');
  const titleImageUrl = getS3ImageURL('4-2/title.png');
  const compareTitleImageUrl = getS3ImageURL('4-2/compareTitle.png');

  const selectedCard = () => {
    const cardId = selectedCardId();
    return cardId ? compareStepScripts.find(c => c.id === cardId) : null;
  };

  onMount(async () => {
    try {
      const imagesToPreload = [
        backgroundImageUrl,
        titleImageUrl,
        compareTitleImageUrl,
        getS3ImageURL('4-2/clearText.png'),
        ...compareStepScripts.map(card => getS3ImageURL(card.bgPng)),
        getS3ImageURL('4-2/smartie.png'),
        getS3ImageURL('4-2/kylie.png'),
        getS3ImageURL('4-2/logos.png'),
      ];
      
      await preloadImages(imagesToPreload);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true); // 에러가 발생해도 화면은 표시
    }
  });

  const handleCardClick = (cardId: number) => {
    setSelectedCardId(cardId);
  };

  const handleBack = () => {
    setSelectedCardId(null);
    // 돌아온 후 모든 카드가 완료되었는지 확인
    if (areAllCardsCompleted()) {
      const worldId = params.worldId || '4';
      const classId = params.classId || '2';
      navigate(`/${worldId}/${classId}/3`);
    }
  };

  const isCardCompleted = (cardId: number) => {
    const storageKey = `compareAiAssistant_${cardId}`;
    return localStorage.getItem(storageKey) !== null;
  };

  const areAllCardsCompleted = () => {
    return compareStepScripts.every(card => isCardCompleted(card.id));
  };

  // 모든 카드가 완료되었는지 확인하고, 완료되면 다음 단계로 이동
  createEffect(() => {
    // 카드 선택 화면일 때만 확인
    if (!selectedCardId() && isReady() && areAllCardsCompleted()) {
      const worldId = params.worldId || '4';
      const classId = params.classId || '2';
      navigate(`/${worldId}/${classId}/3`);
    }
  });

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <Show 
        when={selectedCard()} 
        fallback={
          <div class={pageContainerStyles.container}>
            <div 
              class={styles.container}
              style={{ 'background-image': `url(${backgroundImageUrl})` }}
            >
              <div class={styles.contentWrapper}>

                <img 
                  src={titleImageUrl} 
                  alt="주제를 선택해보세요" 
                  class={styles.titleImage}
                />
                
                <div class={styles.cardsContainer}>
                  {compareStepScripts.map((card) => {
                    const isCompleted = isCardCompleted(card.id);
                    return (
                      <div 
                        class={`${styles.card} ${isCompleted ? styles.cardCompleted : ''}`}
                        onClick={() => handleCardClick(card.id)}
                      >
                        {isCompleted && (
                          <div class={styles.clearOverlay}>
                            <img 
                              src={getS3ImageURL('4-2/clearText.png')} 
                              alt="CLEAR" 
                              class={styles.clearText}
                            />
                          </div>
                        )}
                        <h1 class={styles.cardTitle}>{card.id}</h1>
                        <img 
                          src={getS3ImageURL(card.bgPng)} 
                          alt={card.summary}
                          class={styles.cardIllustration}
                        />
                        <p class={styles.cardText}>{card.summary}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        }
      >
        {(card) => (
          <CompareAiAssistantDetail 
            content={card().content} 
            cardId={card().id}
            onBack={handleBack}
          />
        )}
      </Show>
    </Show>
  );
};

export default CompareAiAssistants;

