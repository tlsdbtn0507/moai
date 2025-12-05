import { Show, createSignal, onMount } from 'solid-js';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { LoadingSpinner } from '../LoadingSpinner';
import { CompareStepScriptInterface } from '../../data/scripts/4-2';
import styles from './CompareAiAssistantDetail.module.css';
import pageContainerStyles from '../../styles/PageContainer.module.css';

type CompareAiAssistantDetailProps = {
  content: CompareStepScriptInterface;
  cardId: number;
  onBack: () => void;
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
  const [inputValue, setInputValue] = createSignal('');

  const backgroundImageUrl = getS3ImageURL('4-2/preBg.png');
  const titleImageUrl = getS3ImageURL('4-2/compareTitle.png');

  const currentCharacterImage = () => getS3ImageURL(`4-2/${selectedCharacter()}.png`);
  const currentCharacterName = () => characterNames[selectedCharacter()];
  const currentCharacterMessages = () => {
    const character = selectedCharacter();
    return props.content[character];
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

  const handleSubmit = () => {
    const value = inputValue().trim();
    if (value.length > 0) {
      // 로컬 스토리지에 주제 번호 저장
      const storageKey = `compareAiAssistant_${props.cardId}`;
      localStorage.setItem(storageKey, value);
      
      // CompareAiAssistants로 돌아가기
      props.onBack();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue().trim().length > 0) {
      handleSubmit();
    }
  };

  const characters: CharacterType[] = ['smartie', 'kylie', 'logos'];

  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <div class={pageContainerStyles.container}>
        <div 
          class={styles.container}
          style={{ 'background-image': `url(${backgroundImageUrl})` }}
        >
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
                    <button 
                      class={styles.arrowButton}
                      onClick={() => {
                        const currentIndex = characters.indexOf(selectedCharacter());
                        const prevIndex = currentIndex === 0 ? characters.length - 1 : currentIndex - 1;
                        setSelectedCharacter(characters[prevIndex]);
                      }}
                    >
                      ←
                    </button>
                    <h2 class={styles.characterName}>{currentCharacterName()}</h2>
                    <button 
                      class={styles.arrowButton}
                      onClick={() => {
                        const currentIndex = characters.indexOf(selectedCharacter());
                        const nextIndex = currentIndex === characters.length - 1 ? 0 : currentIndex + 1;
                        setSelectedCharacter(characters[nextIndex]);
                      }}
                    >
                      →
                    </button>
                  </div>
                  
                  <div class={styles.characterImageContainer}>
                    <img 
                      src={currentCharacterImage()} 
                      alt={currentCharacterName()}
                      class={styles.characterImage}
                    />
                  </div>
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

            {/* 하단 입력 영역 */}
            <div class={styles.inputArea}>
              <input 
                type="text" 
                placeholder="세 비서의 대답을 듣고, 어느 비서의 대답이 좋았는지 이유를 적어주세요."
                class={styles.inputField}
                value={inputValue()}
                onInput={(e) => setInputValue(e.currentTarget.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                class={styles.submitButton}
                onClick={handleSubmit}
                disabled={inputValue().trim().length === 0}
              >
                입력
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default CompareAiAssistantDetail;
