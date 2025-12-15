import { Show, createSignal, onMount, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { LoadingSpinner } from '../LoadingSpinner';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { compareStepScripts, compareAiAssistantSelectionScripts } from '../../data/scripts/4-2';
import CompareAiAssistantDetail from './CompareAiAssistantDetail';
import CompareAiAssistantSelection from './CompareAiAssistantSelection';
import { CompareAiAssistantSelectionFlow } from './CompareAiAssistantSelectionFlow';
import styles from './CompareAiAssistants.module.css';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import { getCardSelection } from '../../utils/aiCompareCheck';

const CompareAiAssistants = () => {
  const [isReady, setIsReady] = createSignal(false);
  const [selectedCardId, setSelectedCardId] = createSignal<number | null>(null);
  const [showSelection, setShowSelection] = createSignal(false);
  const [showSelectionFlow, setShowSelectionFlow] = createSignal(false);
  const [refreshTrigger, setRefreshTrigger] = createSignal(0);
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
        ...compareAiAssistantSelectionScripts.map(s => getS3ImageURL(s.bgPng)),
        ...compareAiAssistantSelectionScripts.map(s => getS3ImageURL(s.maiPng)),
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
    refreshCompletionStatus(); // 완료 상태 새로고침
  };

  const getCardData = (cardId: number) => {
    refreshTrigger(); // 반응성 트리거
    return getCardSelection(cardId);
  };

  const isCardCompleted = (cardId: number) => {
    return getCardData(cardId) !== null;
  };

  const areAllCardsCompleted = () => {
    return compareStepScripts.every(card => isCardCompleted(card.id));
  };

  const allCompleted = createMemo(() => {
    refreshTrigger(); // 반응성 트리거
    return areAllCardsCompleted();
  });

  // 카드 완료 상태를 강제로 새로고침하는 함수
  const refreshCompletionStatus = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      {/* 선택 플로우가 우선 표시 */}
      <div class={pageContainerStyles.container}>
      <Show when={showSelectionFlow()} fallback={
      <Show 
        when={selectedCard()} 
        fallback={
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
                      const cardData = getCardData(card.id);
                      const isCompleted = !!cardData;
                    return (
                      <div 
                        class={`${styles.card} ${isCompleted ? styles.cardCompleted : ''}`}
                        onClick={() => handleCardClick(card.id)}
                      >
                        {isCompleted && (
                          <div class={styles.clearOverlay}>
                              {cardData?.character && (
                                <img
                                  src={getS3ImageURL(`4-2/${cardData.character}.png`)}
                                  alt={cardData.character}
                                  class={styles.clearCharacter}
                                />
                              )}
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
                  <Show when={allCompleted()}>
                    <div class={styles.completeButtonContainer}>
                      <button
                        class={styles.completeButton}
                      onClick={() => {
                        setShowSelectionFlow(true);
                      }}
                      >
                        넘어가기
                      </button>
              </div>
                  </Show>
            </div>
          </div>
        }
      >
        {(card) => (
            <Show 
            when={!showSelection()}
            fallback={
              <CompareAiAssistantSelection
              content={card().content}
              cardId={card().id}
              onBack={() => {
                setShowSelection(false);
                setSelectedCardId(null);
                refreshCompletionStatus(); // 완료 상태 새로고침
              }}
              />
            }
            >
          <CompareAiAssistantDetail 
            content={card().content} 
            cardId={card().id}
            onBack={handleBack}
                onAllCompleted={() => {
                  setShowSelection(true);
                }}
          />
            </Show>
        )}
        </Show>
      }>
        <CompareAiAssistantSelectionFlow
          scripts={compareAiAssistantSelectionScripts}
          onAllComplete={() => {
            const worldId = params.worldId || '4';
            const classId = params.classId || '2';
            navigate(`/${worldId}/${classId}/3`);
          }}
        />
      </Show>
          </div>
    </Show>
  );
};

export default CompareAiAssistants;

