import { Show, createSignal, onMount } from 'solid-js';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { LoadingSpinner } from '../LoadingSpinner';
import { CompareStepScriptInterface } from '../../data/scripts/4-2';
import styles from './CompareAiAssistantDetail.module.css';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import { setCharacterChecked, isCharacterChecked, areAllCharactersChecked } from '../../utils/aiCompareCheck';

type CompareAiAssistantDetailProps = {
  content: CompareStepScriptInterface;
  cardId: number;
  onBack: () => void;
  onAllCompleted?: () => void;
};

type CharacterType = 'smartie' | 'kylie' | 'logos';

const characterNames: Record<CharacterType, string> = {
  smartie: '스마티',
  kylie: '카일리',
  logos: '로고스',
};

const CompareAiAssistantDetail = (props: CompareAiAssistantDetailProps) => {
  const [isReady, setIsReady] = createSignal(false);
  const [selectedCharacter, setSelectedCharacter] = createSignal<CharacterType>('smartie');

  const backgroundImageUrl = getS3ImageURL('4-2/preBg.png');
  const titleImageUrl = getS3ImageURL('4-2/compareTitle.png');

  const currentCharacterImage = () => getS3ImageURL(`4-2/${selectedCharacter()}.png`);
  const currentCharacterName = () => characterNames[selectedCharacter()];
  const currentCharacterMessages = () => {
    const character = selectedCharacter();
    return props.content[character];
  };

  const characters: CharacterType[] = ['smartie', 'kylie', 'logos'];

  // 현재 캐릭터 확인 상태
  const isCurrentCharacterCompleted = () => {
    return isCharacterChecked(props.cardId, selectedCharacter());
  };

  // 확인하지 않은 다음 캐릭터 찾기
  const getNextUncompletedCharacter = () => {
    const currentIndex = characters.indexOf(selectedCharacter());
    // 현재 캐릭터부터 시작해서 확인하지 않은 캐릭터 찾기
    for (let i = 1; i <= characters.length; i++) {
      const nextIndex = (currentIndex + i) % characters.length;
      const nextCharacter = characters[nextIndex];
      if (!isCharacterChecked(props.cardId, nextCharacter)) {
        return nextCharacter;
      }
    }
    return null; // 모든 캐릭터가 확인됨
  };

  // 비교 완료 버튼 클릭 핸들러
  const handleComplete = () => {
    const currentChar = selectedCharacter();
    // 현재 캐릭터를 확인 처리
    setCharacterChecked(props.cardId, currentChar, true);
    
    // 확인하지 않은 다음 캐릭터로 이동
    const nextUncompleted = getNextUncompletedCharacter();
    if (nextUncompleted) {
      setSelectedCharacter(nextUncompleted);
    } else {
      // 모든 캐릭터가 확인되었으면 새 컴포넌트로 이동
      if (props.onAllCompleted) {
        props.onAllCompleted();
      } else {
        props.onBack();
      }
    }
  };

  onMount(async () => {
    try {
      const imagesToPreload = [
        backgroundImageUrl,
        titleImageUrl,
        getS3ImageURL('4-2/smartie.png'),
        getS3ImageURL('4-2/kylie.png'),
        getS3ImageURL('4-2/logos.png'),
      ];
      
      await preloadImages(imagesToPreload);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true);
    }
  });

  const selectCharacter = (character: CharacterType) => {
    setSelectedCharacter(character);
  };

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={pageContainerStyles.container}>
        <div 
          class={styles.container}
          style={{ 'background-image': `url(${backgroundImageUrl})` }}
        >
          {/* 좌상단 뒤로 가기 버튼 */}
          <button 
            class={styles.backButton}
            onClick={() => props.onBack()}
          >
            뒤로
          </button>
          
          <div class={styles.contentWrapper}>
            <img 
              src={titleImageUrl} 
              alt="각 비서의 답변을 비교해보세요" 
              class={styles.titleImage}
            />
            
            <div class={styles.mainContent}>
              {/* 왼쪽 패널 - 캐릭터 선택 */}
              <div class={styles.characterPanel}>
                <div class={styles.characterSelector}>
                  {characters.map((char) => (
                    <button
                      class={`${styles.characterButton} ${selectedCharacter() === char ? styles.active : ''}`}
                      onClick={() => selectCharacter(char)}
                    >
                      <img 
                        src={getS3ImageURL(`4-2/${char}.png`)} 
                        alt={characterNames[char]}
                        class={styles.characterIcon}
                      />
                    </button>
                  ))}
                </div>
                <div class={styles.characterNameWrapper}>
                  <div class={styles.characterNameContainer}>
                    <h2 class={styles.characterName}>{currentCharacterName()}</h2>
                  </div>
                  
                  <div class={styles.characterImageContainer}>
                    <img 
                      src={currentCharacterImage()} 
                      alt={currentCharacterName()}
                      class={styles.characterImage}
                    />
                  </div>
                                  {/* 비교 완료 버튼 */}
                  {/* <div class={styles.completeButtonContainer}>
                    <button 
                      class={`${styles.completeButton} ${isCurrentCharacterCompleted() ? styles.completeButtonDisabled : ''}`}
                      onClick={handleComplete}
                      disabled={isCurrentCharacterCompleted()}
                    >
                      {isCurrentCharacterCompleted() ? '이미 확인함' : '비교 완료'}
                    </button>
                  </div> */}
                </div>
              </div>

              {/* 오른쪽 패널 - 대화창 */}
              <div class={styles.dialoguePanel}>
                <div class={styles.userQuestion}>
                  <div class={styles.userAvatar}>
                    <img src={getS3ImageURL('4-2/questionMarkMai.png')} alt="마이 대화" />
                  </div>
                  <span class={styles.questionText}>{props.content.questionScript}</span>
                </div>
                
                <div class={styles.assistantMessages}>
                  {currentCharacterMessages().map((message) => (
                    <div class={styles.messageBubble}>
                      <img 
                        src={currentCharacterImage()} 
                        alt={currentCharacterName()}
                        class={styles.messageAvatar}
                      />
                      <div class={styles.messageText}>{message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 화살표 버튼 영역 */}
            <div class={styles.inputArea}>
              <button 
                class={styles.arrowButton}
                onClick={() => {
                  const currentIndex = characters.indexOf(selectedCharacter());
                  const prevIndex = currentIndex === 0 ? characters.length - 1 : currentIndex - 1;
                  setSelectedCharacter(characters[prevIndex]);
                }}
              >
                이전
              </button>
              <button 
                class={styles.arrowButton}
                onClick={() => {
                  const currentChar = selectedCharacter();
                  // 현재 캐릭터가 확인되지 않았다면 자동으로 확인 처리
                  if (!isCharacterChecked(props.cardId, currentChar)) {
                    setCharacterChecked(props.cardId, currentChar, true);
                  }
                  
                  const currentIndex = characters.indexOf(currentChar);
                  const nextIndex = currentIndex === characters.length - 1 ? 0 : currentIndex + 1;
                  setSelectedCharacter(characters[nextIndex]);
                  
                  // 모든 캐릭터가 확인되었는지 확인
                  if (areAllCharactersChecked(props.cardId) && props.onAllCompleted) {
                    // 약간의 딜레이를 주어 UI 업데이트 후 실행
                    setTimeout(() => {
                      props.onAllCompleted!();
                    }, 100);
                  }
                }}
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default CompareAiAssistantDetail;
