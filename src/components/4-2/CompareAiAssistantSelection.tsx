import { Show, createSignal, onMount } from 'solid-js';
import { getS3ImageURL, preloadImages } from '../../utils/loading';
import { LoadingSpinner } from '../LoadingSpinner';
import { CompareStepScriptInterface } from '../../data/scripts/4-2';
import styles from './CompareAiAssistantSelection.module.css';
import pageContainerStyles from '../../styles/PageContainer.module.css';
import { setCardSelection, clearCardData } from '../../utils/aiCompareCheck';

type CompareAiAssistantSelectionProps = {
  content: CompareStepScriptInterface;
  cardId: number;
  onBack: () => void;
  onSubmit?: () => void; // 제출 후 호출할 콜백 (선택사항)
};

const characterScripts  = [
  {
    id:1,
    smartie: "출제 범위와 평가 기준을 보고\n개념을 압축하여 보세요.\n점검도 중요합니다.",
    kylie: "긴장되더라도 잘할 수 있을거야.\n이미 지금껏 잘해왔잖아?",
    logos: "불안의 근원을 찾아보세.\n정리하면, 내일의 길이\n분명해질걸세.",
  },
  {
    id:2,
    smartie: "중심을 먼저 잡고,\n예시를 연결하겠습니다.\n추가 문제도 적용해봅시다.",
    kylie: "어렵게 느껴지는게 당연해!\n막힌 부분부터 풀어보자.\n같이 하면 돼!",
    logos: "이미 알고 있는 부분이 시작이네.\n비어 있는 틈을 찾아보세.\n틈을 채우면 개념이 보일걸세.",
  },
  {
    id:3,
    smartie: "불안의 원인을 명확히 하고\n해결 방안을 찾아봅시다.",
    kylie: "시험을 앞두면 누구나 불안해!\n넌 잘할 수 있을거야!",
    logos: "통제 가능한 부분을 찾아보게.\n하나씩 다루면 자연스럽게\n줄어들 것일세.",
  },
]

type CharacterType = 'smartie' | 'kylie' | 'logos';

const characterNames: Record<CharacterType, string> = {
  smartie: '스마티',
  kylie: '카일리',
  logos: '로고스',
};

const CompareAiAssistantSelection = (props: CompareAiAssistantSelectionProps) => {
  const [isReady, setIsReady] = createSignal(false);
  const [inputValue, setInputValue] = createSignal('');
  const [selectedCharacter, setSelectedCharacter] = createSignal<CharacterType | null>(null);

  const backgroundImageUrl = getS3ImageURL('4-2/preBg.png');

  const characters: CharacterType[] = ['smartie', 'kylie', 'logos'];

  const getCharacterResponse = (character: CharacterType): string => {
    const script = characterScripts.find(s => s.id === props.cardId);
    if (script) {
      return script[character];
    }
    // fallback: 기존 방식
    const responses = props.content[character];
    return responses.join(' ');
  };

  const handleCharacterSelect = (character: CharacterType) => {
    setSelectedCharacter(character);
    // 선택 시 입력이 비어 있어도 저장하지 않음, 제출 시 저장
  };

  const handleSubmit = () => {
    const value = inputValue().trim();
    const character = selectedCharacter();
    
    if (!character || value.length === 0) return;
    
    // 선택한 비서와 이유 저장
    setCardSelection(props.cardId, character, value);
    
    // 제출 후 콜백이 있으면 호출, 없으면 onBack 호출
    if (props.onSubmit) {
      props.onSubmit();
    } else {
      props.onBack();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue().trim().length > 0 && selectedCharacter()) {
      handleSubmit();
    }
  };

  onMount(async () => {
    try {
      const imagesToPreload = [
        backgroundImageUrl,
        getS3ImageURL('4-2/smartie.png'),
        getS3ImageURL('4-2/kylie.png'),
        getS3ImageURL('4-2/logos.png'),
        getS3ImageURL('4-2/icon.png'),
      ];
      
      await preloadImages(imagesToPreload);
      setIsReady(true);
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      setIsReady(true);
    }
  });

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
            onClick={() => {
              // 해당 주제의 aiCompareCheck 데이터 비우기
              clearCardData(props.cardId);
              props.onBack();
            }}
          >
            이전
          </button>
          
          <div class={styles.contentWrapper}>
            {/* 헤더 */}
            <h1 class={styles.header}>상황에 맞게 대답한 비서를 골라보세요</h1>
            
            {/* 메인 카드 */}
            <div class={styles.mainCard}>
              {/* 질문 */}
              <div class={styles.questionSection}>
                <h2 class={styles.questionText}>{props.content.questionScript}</h2>
              </div>
              
              {/* 캐릭터 비교 섹션 */}
              <div class={styles.charactersContainer}>
                {characters.map((character) => (
                  <div 
                    class={`${styles.characterSection} ${selectedCharacter() === character ? styles.selected : ''}`}
                    onClick={() => handleCharacterSelect(character)}
                  >
                    {/* 응답 말풍선 */}
                    <div class={`${styles.responseBubble} ${selectedCharacter() === character ? styles.selectedContent : styles.unselectedContent}`}>
                      <p class={styles.responseText}>{getCharacterResponse(character)}</p>
                    </div>
                    
                    {/* 핀 아이콘 - 선택 전에는 모두 표시, 선택 후에는 선택된 캐릭터만 표시 */}
                    {(!selectedCharacter() || selectedCharacter() === character) && (
                      <div class={styles.pinIcon}>
                        <img 
                          src={getS3ImageURL('4-2/icon.png')} 
                          alt="pin icon"
                          class={styles.pinIconImage}
                        />
                      </div>
                    )}
                    
                    {/* 캐릭터 이미지 */}
                    <div class={`${styles.characterImageWrapper} ${selectedCharacter() === character ? styles.selectedContent : styles.unselectedContent}`}>
                      <img 
                        src={getS3ImageURL(`4-2/${character}.png`)} 
                        alt={characterNames[character]}
                        class={styles.characterImage}
                      />
                    </div>
                    
                    {/* 캐릭터 이름 */}
                    <h3 class={`${styles.characterName} ${selectedCharacter() === character ? styles.selectedContent : styles.unselectedContent}`}>{characterNames[character]}</h3>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 하단 입력 섹션 */}
            <div class={styles.inputSection}>
              <span class={styles.inputPrompt}></span>
              <div class={styles.inputContainer}>
                <input 
                  type="text" 
                  class={styles.inputField}
                  placeholder="위 비서를 고른 이유를 적어주세요."
                  value={inputValue()}
                  onInput={(e) => setInputValue(e.currentTarget.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  class={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={inputValue().trim().length === 0 || !selectedCharacter()}
                >
                  입력
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default CompareAiAssistantSelection;
