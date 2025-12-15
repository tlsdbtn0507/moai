type CharacterType = 'smartie' | 'kylie' | 'logos';

interface CharacterCheck {
  [character: string]: boolean;
}

interface CardSelection {
  character: CharacterType;
  reason: string;
}

interface AiCompareCheckData {
  // 카드별 캐릭터 확인 상태
  checks: {
    [cardId: number]: CharacterCheck;
  };
  // 카드별 선택한 캐릭터와 이유
  selections: {
    [cardId: number]: CardSelection;
  };
}

const STORAGE_KEY = 'aiCompareCheck';

// 로컬스토리지에서 데이터 가져오기
const getStoredData = (): AiCompareCheckData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse aiCompareCheck data:', error);
  }
  return { checks: {}, selections: {} };
};

// 로컬스토리지에 데이터 저장
const saveData = (data: AiCompareCheckData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save aiCompareCheck data:', error);
  }
};

// 캐릭터 확인 상태 설정
export const setCharacterChecked = (cardId: number, character: CharacterType, checked: boolean) => {
  const data = getStoredData();
  if (!data.checks[cardId]) {
    data.checks[cardId] = {};
  }
  data.checks[cardId][character] = checked;
  saveData(data);
};

// 캐릭터 확인 상태 확인
export const isCharacterChecked = (cardId: number, character: CharacterType): boolean => {
  const data = getStoredData();
  return data.checks[cardId]?.[character] === true;
};

// 카드의 모든 캐릭터가 확인되었는지 확인
export const areAllCharactersChecked = (cardId: number): boolean => {
  const data = getStoredData();
  const cardChecks = data.checks[cardId];
  if (!cardChecks) return false;
  
  const characters: CharacterType[] = ['smartie', 'kylie', 'logos'];
  return characters.every((char) => cardChecks[char] === true);
};

// 선택한 캐릭터와 이유 저장
export const setCardSelection = (cardId: number, character: CharacterType, reason: string) => {
  const data = getStoredData();
  data.selections[cardId] = { character, reason };
  saveData(data);
};

// 선택한 캐릭터와 이유 가져오기
export const getCardSelection = (cardId: number): CardSelection | null => {
  const data = getStoredData();
  return data.selections[cardId] || null;
};

// 특정 카드 데이터 초기화
export const clearCardData = (cardId: number) => {
  const data = getStoredData();
  delete data.checks[cardId];
  delete data.selections[cardId];
  saveData(data);
};

// 모든 데이터 초기화
export const resetAiCompareCheck = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// 특정 카드의 모든 선택 데이터 가져오기 (FinishingUpq에서 사용)
export const getAllCardSelections = (): { [cardId: number]: CardSelection } => {
  const data = getStoredData();
  return data.selections || {};
};
