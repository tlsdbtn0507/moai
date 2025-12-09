import { createSignal, Show, createEffect } from 'solid-js';
import styles from '../MakingOwnAiAssistant.module.css';
import { AI_ASSISTANT_TYPES } from '../../../data/aiAssistantTypes';
import { getS3ImageURL } from '../../../utils/loading';
import { aiAssistantElements } from '../../../store/4/aiAssistantElementStore';

interface AiFunctionProps {
  onSelectionChange?: (isSelected: boolean, typeId: number) => void;
  onDragComplete?: () => void;
  onMoveToNextTab?: (moveFn: () => void) => void;
  onSelectionStateChange?: (isSelected: boolean, activeTab: number) => void;
}

const AiFunction = (props: AiFunctionProps = {}) => {
  const [activeTab, setActiveTab] = createSignal(1); // 역할 탭이 기본 선택
  // 각 inputField에 선택된 feature를 저장 (최대 3개)
  const [selectedFeatures, setSelectedFeatures] = createSignal<(string | null)[]>([null, null, null]);
  const [isSelected, setIsSelected] = createSignal(false);
  // 직접 입력 모드 상태
  const [isDirectInputMode, setIsDirectInputMode] = createSignal(false);
  const [directInputValue, setDirectInputValue] = createSignal('');
  const [isSubmittingDirectInput, setIsSubmittingDirectInput] = createSignal(false);
  // 동적으로 추가된 기능들 (타입별로 관리)
  const [customFeatures, setCustomFeatures] = createSignal<{[key: number]: string[]}>({});
  
  const currentType = () => AI_ASSISTANT_TYPES.find(type => type.id === activeTab()) || AI_ASSISTANT_TYPES[0];

  // isSelected 변경 시 부모에게 알림
  createEffect(() => {
    if (props.onSelectionChange) {
      props.onSelectionChange(isSelected(), currentType().id);
    }
    // isSelected와 activeTab 상태를 부모에게 전달
    if (props.onSelectionStateChange) {
      props.onSelectionStateChange(isSelected(), activeTab());
    }
  });

  // activeTab 변경 시에도 부모에게 알림
  createEffect(() => {
    if (props.onSelectionStateChange) {
      props.onSelectionStateChange(isSelected(), activeTab());
    }
  });

  // 드래그 시작
  const handleDragStart = (e: DragEvent, feature: string) => {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', feature);
    }
  };

  // 드롭 영역 위에 있을 때
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  // 드롭 처리
  const handleDrop = (e: DragEvent, index: number) => {
    e.preventDefault();
    const feature = e.dataTransfer?.getData('text/plain');
    if (feature) {
      const current = selectedFeatures();
      // 이미 같은 feature가 다른 위치에 있는지 확인
      const existingIndex = current.findIndex((f, i) => f === feature && i !== index);
      if (existingIndex !== -1) {
        // 다른 위치에 있으면 제거
        const newFeatures = [...current];
        newFeatures[existingIndex] = null;
        newFeatures[index] = feature;
        setSelectedFeatures(newFeatures);
      } else {
        // 새로 추가
        const newFeatures = [...current];
        newFeatures[index] = feature;
        setSelectedFeatures(newFeatures);
      }
    }
  };

  // 선택된 feature인지 확인
  const isFeatureSelected = (feature: string) => {
    return selectedFeatures().includes(feature);
  };

  // feature 제거
  const removeFeature = (index: number) => {
    const newFeatures = [...selectedFeatures()];
    newFeatures[index] = null;
    setSelectedFeatures(newFeatures);
  };

  // 스토어에서 해당 타입의 features 가져오기
  const getFeaturesFromStore = (typeId: number): (string | null)[] => {
    const elements = aiAssistantElements;
    let features: string[] = [];
    
    switch (typeId) {
      case 1: // role
        features = elements.role;
        break;
      case 2: // function
        features = elements.function;
        break;
      case 3: // tone
        features = elements.tone;
        break;
      case 4: // rule
        features = elements.rule;
        break;
      case 5: // tool
        features = elements.tool;
        break;
    }
    
    // 최대 3개까지만 채우고 나머지는 null
    const result: (string | null)[] = [...features];
    while (result.length < 3) {
      result.push(null);
    }
    return result.slice(0, 3);
  };

  // 탭 변경 시 선택된 feature 초기화 또는 스토어에서 가져오기
  const handleTabChange = (typeId: number) => {
    setActiveTab(typeId);
    
    // 직접 입력 모드 초기화
    setIsDirectInputMode(false);
    setDirectInputValue('');
    setIsSubmittingDirectInput(false);
    
    // 완료된 탭이면 스토어에서 features 가져오고 선택 완료 화면 표시
    if (isTypeCompleted(typeId)) {
      const storeFeatures = getFeaturesFromStore(typeId);
      setSelectedFeatures(storeFeatures);
      setIsSelected(true);
    } else {
      // 미완료 탭이면 초기화
      setSelectedFeatures([null, null, null]);
      setIsSelected(false);
    }
  };

  // 해당 타입의 선택이 완료되었는지 확인 (스토어에 features가 있는지)
  const isTypeCompleted = (typeId: number) => {
    const elements = aiAssistantElements;
    switch (typeId) {
      case 1: // role
        return elements.role.length > 0;
      case 2: // function
        return elements.function.length > 0;
      case 3: // tone
        return elements.tone.length > 0;
      case 4: // rule
        return elements.rule.length > 0;
      case 5: // tool
        return elements.tool.length > 0;
      default:
        return false;
    }
  };

  // 완료되지 않은 탭이 있는지 확인 (현재 탭 제외)
  const hasIncompleteTabs = (excludeTabId?: number) => {
    return AI_ASSISTANT_TYPES.some(type => 
      type.id !== excludeTabId && !isTypeCompleted(type.id)
    );
  };

  // 완료되지 않은 다음 탭으로 이동
  const moveToNextIncompleteTab = () => {
    const currentTabId = activeTab();
    
    // 현재 탭을 제외한 완료되지 않은 탭이 있는지 확인
    if (!hasIncompleteTabs(currentTabId)) {
      // 모든 탭이 완료되었으면 false로만 변경
      setIsSelected(false);
      return;
    }

    // 현재 탭의 다음부터 순환하면서 완료되지 않은 탭 찾기
    // 현재 탭의 인덱스 찾기
    const currentIndex = AI_ASSISTANT_TYPES.findIndex(type => type.id === currentTabId);
    
    // 현재 탭 다음부터 시작해서 순환하며 미완료 탭 찾기
    for (let i = 1; i < AI_ASSISTANT_TYPES.length; i++) {
      const nextIndex = (currentIndex + i) % AI_ASSISTANT_TYPES.length;
      const nextTab = AI_ASSISTANT_TYPES[nextIndex];
      
      // 완료되지 않은 탭을 찾으면 이동
      if (!isTypeCompleted(nextTab.id)) {
        setActiveTab(nextTab.id);
        setSelectedFeatures([null, null, null]);
        setIsSelected(false);
        return;
      }
    }
    
    // 위 루프에서 찾지 못했다면 (이론적으로는 발생하지 않아야 함)
    // 첫 번째 완료되지 않은 탭으로 이동
    const firstIncomplete = AI_ASSISTANT_TYPES.find(type => !isTypeCompleted(type.id));
    if (firstIncomplete) {
      setActiveTab(firstIncomplete.id);
      setSelectedFeatures([null, null, null]);
      setIsSelected(false);
    } else {
      setIsSelected(false);
    }
  };

  // moveToNextTab 함수를 부모에게 전달
  createEffect(() => {
    if (props.onMoveToNextTab) {
      props.onMoveToNextTab(moveToNextIncompleteTab);
    }
  });

  // 완료 버튼 활성화 여부 (하나라도 선택되어 있으면 활성화)
  const isCompleteButtonEnabled = () => {
    return selectedFeatures().some(feature => feature !== null);
  };

  // 현재 타입의 features 가져오기 (동적으로 추가된 기능 포함)
  const getCurrentFeatures = () => {
    const baseFeatures = currentType().features;
    const custom = customFeatures()[activeTab()] || [];
    
    // 커스텀 기능이 있으면 "직접 입력" 버튼 제외, 없으면 포함
    const featuresWithoutDirectInput = baseFeatures.filter(f => !f.includes('직접 입력'));
    
    // 커스텀 기능이 있으면 직접 입력 버튼 없이 커스텀 기능만, 없으면 직접 입력 포함
    if (custom.length > 0) {
      return [...featuresWithoutDirectInput, ...custom];
    } else {
      return baseFeatures;
    }
  };

  // 직접 입력 버튼 클릭 핸들러
  const handleDirectInputClick = () => {
    setIsDirectInputMode(true);
    setDirectInputValue('');
    setIsSubmittingDirectInput(false);
  };

  // 직접 입력 제출 핸들러
  const handleDirectInputSubmit = () => {
    if (isSubmittingDirectInput()) return;
    setIsSubmittingDirectInput(true);
    
    const input = directInputValue().trim();
    if (!input) {
      setIsDirectInputMode(false);
      setIsSubmittingDirectInput(false);
      return;
    }

    // 현재 타입의 커스텀 기능에 추가
    const currentCustom = customFeatures()[activeTab()] || [];
    setCustomFeatures({
      ...customFeatures(),
      [activeTab()]: [...currentCustom, input]
    });

    // 입력 모드 종료
    setIsDirectInputMode(false);
    setDirectInputValue('');
    setIsSubmittingDirectInput(false);
  };

  // 직접 입력 취소 핸들러
  const handleDirectInputCancel = () => {
    setIsDirectInputMode(false);
    setDirectInputValue('');
    setIsSubmittingDirectInput(false);
  };

  // 직접 입력 키 핸들러
  const handleDirectInputKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      handleDirectInputSubmit();
    } else if (e.key === 'Escape') {
      handleDirectInputCancel();
    }
  };


  return (
    <div class={styles.aiFunctionWrapper}>
      {/* 탭 네비게이션 */}
        <div class={styles.tabsContainer}>
            {AI_ASSISTANT_TYPES.map((type) => {
              const isCompleted = isTypeCompleted(type.id);
              const isActive = activeTab() === type.id;
              
              // 완료되었으면 항상 색상 적용, 아니면 활성화된 경우만
              const backgroundColor = isCompleted || isActive ? type.color : '#E0E0E0';
              
              return (
                <button
                  class={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                  style={{
                    'background-color': backgroundColor,
                  }}
                  onClick={() => handleTabChange(type.id)}
                >
                  {type.name}
                </button>
              );
            })}
        </div>
        <div class={styles.mainContentWrapper}>
            <Show when={!isSelected()}>
            {/* 메인 콘텐츠 영역 */}
            <div class={styles.mainContentArea}>
                {/* 왼쪽: 드래그 앤 드롭 영역 */}
                <div class={styles.dragDropArea} style={{ 'background-color': `${currentType().color}33`, }}>
                    {/* 도형은 CSS로 구현하거나 이미지로 처리 */}
                    <img class={styles.shapeImage} src={getS3ImageURL(currentType().partUrl)} alt={currentType().name} />
                </div>

                {/* 오른쪽: 입력 영역 */}
                <div 
                class={styles.inputArea}
                style={{
                    'background-color': `${currentType().color}33`, // 투명도 추가
                }}
                >
                <h2 class={styles.inputTitle}>비서의 {currentType().name}</h2>
                <div class={styles.inputFields}>
                    {[0, 1, 2].map((index) => (
                    <div
                        class={styles.inputField}
                        style={{
                        'background-color': selectedFeatures()[index] 
                            ? currentType().color 
                            : 'white',
                        }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {selectedFeatures()[index] && (
                        <div class={styles.selectedFeature}>
                            <span>{selectedFeatures()[index]}</span>
                            <button
                            class={styles.removeButton}
                            onClick={() => removeFeature(index)}
                            >
                            ×
                            </button>
                        </div>
                        )}
                    </div>
                    ))}
                    <p class={styles.dragInstruction}>이곳에 드래그하여 {currentType().name.toLowerCase()}를 채워보세요.</p>
                </div>
                </div>
            </div>

            {/* 선택 안내 */}
            <div class={styles.selectionHint}>
                <span>1 ~ 3개까지 선택이 가능해요!</span>
            </div>

            {/* 기능 선택 버튼들 */}
            <div class={styles.featureButtonsGrid}>
                {getCurrentFeatures().map((feature, index) => {
                  const isDirectInput = feature.includes('직접 입력');
                  
                  // 직접 입력 모드이고 직접 입력 버튼인 경우 입력 필드 표시
                  if (isDirectInput && isDirectInputMode()) {
                    return (
                      <div>
                        <input
                          type="text"
                          value={directInputValue()}
                          onInput={(e) => setDirectInputValue(e.currentTarget.value)}
                          onKeyDown={handleDirectInputKeyPress}
                          onBlur={handleDirectInputSubmit}
                          placeholder="직접 입력하세요"
                          class={styles.featureButton}
                          style={{
                            'flex': 1,
                            'padding': '0.4rem 0.25rem',
                            'border': `2px solid ${currentType().color}`,
                            'border-radius': '1.5rem',
                            'font-family': 'var(--font-cookierun)',
                            'font-size': '0.7rem',
                            'outline': 'none',
                            'background': 'white',
                            'color': '#333',
                            'width': '100%'
                          }}
                        /></div>
                    );
                  }
                  
                  return (
                    <button
                      draggable={!isFeatureSelected(feature) && !isDirectInput}
                      onDragStart={(e) => !isDirectInput && handleDragStart(e, feature)}
                      onClick={() => {
                        if (isDirectInput && !isDirectInputMode()) {
                          handleDirectInputClick();
                        }
                      }}
                      class={`${styles.featureButton} ${isFeatureSelected(feature) ? styles.featureButtonSelected : ''}`}
                      style={{
                        'background': isFeatureSelected(feature)
                          ? '#E0E0E0'
                          : `linear-gradient(to bottom, ${currentType().color}, ${currentType().color}dd)`,
                        'opacity': isFeatureSelected(feature) ? 0.5 : 1,
                        'cursor': isFeatureSelected(feature) 
                          ? 'not-allowed' 
                          : isDirectInput 
                            ? 'pointer' 
                            : 'grab',
                      }}
                      disabled={isFeatureSelected(feature)}
                    >
                      {feature}
                    </button>
                  );
                })}
            </div>

            {/* 선택 완료 버튼 */}
            <button 
                class={`${styles.completeButton} ${!isCompleteButtonEnabled() ? styles.completeButtonDisabled : ''}`}
                disabled={!isCompleteButtonEnabled()}
                onClick={() => setIsSelected(true)}
            >
                선택 완료
            </button>
            </Show>
            <Show when={isSelected()}>
                <div class={styles.selectedFeaturesWrapper}>
                    <h2>완성된 조각을 오른쪽 비서에게 넣어보세요!</h2>
                    <div class={styles.selectedFeatures}
                    style={{
                        'background-color': `${currentType().color}33`,
                    }}
                    >
                        <span>비서의 {currentType().name}</span>
                        <div style={{ "display" : "flex", "flex-direction" : "column", "gap" : "0.5rem"}}>
                            {selectedFeatures().filter(feature => feature !== null).map((feature) => (
                                <span
                                style={{ "background-color" : `${currentType().color}` , "width" : "200px", "text-align":"center"}}
                                class={styles.featureButton}>{feature}</span>
                            ))}
                        </div>
                        {/* 이미지는 미완료 탭에서만 드래그 가능하도록 표시 */}
                        <Show when={!isTypeCompleted(currentType().id)}>
                            <img 
                              src={getS3ImageURL(currentType().partUrl)} 
                              alt={currentType().name}
                              draggable={true}
                              data-type-id={currentType().id}
                              onDragStart={(e) => {
                                if (e.dataTransfer) {
                                  e.dataTransfer.effectAllowed = 'move';
                                  // 타입 ID와 partUrl, 선택된 features를 전달
                                  e.dataTransfer.setData('application/json', JSON.stringify({
                                    typeId: currentType().id,
                                    partUrl: currentType().partUrl,
                                    features: selectedFeatures().filter(f => f !== null),
                                    typeName: currentType().name,
                                  }));
                                }
                              }}
                              style={{ cursor: 'grab' }}
                            />
                        </Show>
                    </div>
                </div>
            </Show>
        </div>
    </div>
  );
};

export default AiFunction;