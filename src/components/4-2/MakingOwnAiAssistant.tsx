import { Show, createSignal, onMount, createEffect, createMemo } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { LoadingSpinner } from '../LoadingSpinner';
import { getS3ImageURL } from '../../utils/loading';
import { ConfirmButton } from '../1-3/ConfirmButton';
import { useTypingAnimation } from '../../utils/hooks/useTypingAnimation';
import { useAudioPlayback } from '../../utils/hooks/useAudioPlayback';
import { SpeechBubble } from '../SpeechBubble';
import { useSkipControls } from '../../utils/hooks/useSkipControls';
import { setRoleFeatures, setFunctionFeatures, setToneFeatures, setRuleFeatures, setToolFeatures, aiAssistantElements } from '../../store/4/aiAssistantElementStore';

import pageContainerStyles from '../../styles/PageContainer.module.css';
import styles from './MakingOwnAiAssistant.module.css';
import AiFunction from './components/AiFunction';
import CompletionConfirmation from './components/CompletionConfirmation';
import NameInput from './components/NameInput';
import Introduction from './components/Introduction';
import TestInterface from './components/TestInterface';

type Step = 'building' | 'completion' | 'nameInput' | 'introduction' | 'testing';

const MakingOwnAiAssistant = () => {
  const [isReady, setIsReady] = createSignal(true);
  const [currentStep, setCurrentStep] = createSignal<Step>('building');
  const [aiAssistantName, setAiAssistantName] = createSignal('');
  const [audioContextActivated, setAudioContextActivated] = createSignal(false);
  const [wasSkipped, setWasSkipped] = createSignal(false);
  const [showAiStudio, setShowAiStudio] = createSignal(false);
  // 각 hole에 드롭된 타입 정보 저장
  const [droppedTypes, setDroppedTypes] = createSignal<{[key: string]: {partUrl: string, typeName: string, features: string[]}}>({});
  // 드래그 유도를 위한 하이라이트할 hole 타입
  const [highlightedHole, setHighlightedHole] = createSignal<string | null>(null);
  const navigate = useNavigate();
  const params = useParams();

  // 타입 ID를 hole 타입으로 변환
  const typeIdToHoleType = (typeId: number): string | null => {
    const mapping: {[key: number]: string} = {
      1: 'role',
      2: 'function',
      3: 'tone',
      4: 'rule',
      5: 'tool',
    };
    return mapping[typeId] || null;
  };

  // AiFunction에서 선택 상태 변경 시 호출되는 콜백
  const handleSelectionChange = (isSelected: boolean, typeId: number) => {
    if (isSelected) {
      const holeType = typeIdToHoleType(typeId);
      setHighlightedHole(holeType);
    } else {
      setHighlightedHole(null);
    }
  };

  // 타이핑 애니메이션 훅
  const typingAnimation = useTypingAnimation({ typingSpeed: 150 });
  
  // 오디오 재생 훅
  const audioPlayback = useAudioPlayback();

  const speechBubbleMessage = "좋아, 그럼 이번엔 이 조건들을 실제로\n너만의 AI 비서에게 적용해보는 시간이야";

  // 타이핑 애니메이션이 완료되었는지 확인
  const isTypingComplete = () => {
    return typingAnimation.displayedMessage().length === speechBubbleMessage.length || wasSkipped();
  };

  // 스킵 컨트롤 훅
  useSkipControls({
    isTypingSkipped: typingAnimation.isTypingSkipped,
    onFirstSkip: () => {
      typingAnimation.skipTyping();
      typingAnimation.setDisplayedMessage(speechBubbleMessage);
      setWasSkipped(true);
    },
    onSecondSkip: () => {
      audioPlayback.stopAudio();
      // 두 번째 스킵 시 버튼이 나타나도록 함 (이미 wasSkipped가 true이므로 자동으로 표시됨)
    },
  });

  // 오디오 컨텍스트 활성화 함수
  const activateAudioContext = () => {
    if (audioContextActivated()) return;
    
    const emptyAudio = new Audio();
    emptyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    emptyAudio.volume = 0.01;
    emptyAudio.play().then(() => {
      emptyAudio.pause();
      setAudioContextActivated(true);
    }).catch(() => {
      setAudioContextActivated(true);
    });
  };

  // 음성 재생 및 타이핑 애니메이션 시작
  createEffect(() => {
    if (audioContextActivated() && !showAiStudio()) {
      // 오디오 재생
      audioPlayback.playAudio('4-2/4-2_practice_1.mp3');
      
      // 타이핑 애니메이션 시작
      typingAnimation.startTyping(speechBubbleMessage);
    }
    
    // showAiStudio가 true가 되면 오디오 정지
    if (showAiStudio()) {
      audioPlayback.stopAudio();
    }
  });

  onMount(() => {
    const handleUserInteraction = () => {
      activateAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    setTimeout(() => {
      if (!audioContextActivated()) {
        activateAudioContext();
      }
    }, 1000);
  });

  const goToNextStep = () => {
    setShowAiStudio(true);
  };

  // hole 타입과 타입 ID 매핑
  const holeTypeToTypeId: {[key: string]: number} = {
    'role': 1,
    'function': 2,
    'tone': 3,
    'rule': 4,
    'tool': 5,
  };

  // 드래그 중인 타입 ID 추적
  const [draggingTypeId, setDraggingTypeId] = createSignal<number | null>(null);
  
  // AiFunction의 다음 탭으로 이동하는 함수 참조
  let aiFunctionMoveToNextTab: (() => void) | null = null;
  
  // AiFunction에서 다음 탭으로 이동하는 함수를 받아오는 콜백
  const handleMoveToNextTabCallback = (moveFn: () => void) => {
    aiFunctionMoveToNextTab = moveFn;
  };

  // AiFunction의 선택 상태 추적
  const [aiFunctionIsSelected, setAiFunctionIsSelected] = createSignal(false);
  const [aiFunctionActiveTab, setAiFunctionActiveTab] = createSignal<number>(1);

  // AiFunction에서 선택 상태 변경 시 호출되는 콜백
  const handleSelectionStateChange = (isSelected: boolean, activeTab: number) => {
    setAiFunctionIsSelected(isSelected);
    setAiFunctionActiveTab(activeTab);
  };

  // hole 이미지 태그 반환 함수
  const getHoleImage = (holeType: string) => {
    const currentIsSelected = aiFunctionIsSelected();
    const currentActiveTab = aiFunctionActiveTab();
    const holeTypeId = holeTypeToTypeId[holeType];
    
    let imagePath: string;
    let altText: string;

    // isSelected가 true이고 activeTab이 해당 hole 타입과 일치하면 High 이미지 사용
    if (currentIsSelected && currentActiveTab === holeTypeId) {
      imagePath = `4-2/${holeType}HoleHigh.png`;
      altText = `${holeType} hole high`;
      return <img src={getS3ImageURL(imagePath)} class={styles.highlightedHoleImage} alt={altText} />;
    }
    // 이미 드롭된 타입이 있으면 그 이미지 사용
    else if (droppedTypes()[holeType]) {
      const dropped = droppedTypes()[holeType];
      imagePath = dropped.partUrl;
      altText = dropped.typeName;
    }
    // 기본 hole 이미지
    else {
      imagePath = `4-2/${holeType}Hole.png`;
      altText = `${holeType} hole`;
    }

    return <img src={getS3ImageURL(imagePath)} alt={altText} />;
  };

  // 드래그 시작 감지 (전역 이벤트)
  onMount(() => {
    const handleDragStart = (e: DragEvent) => {
      // dataTransfer는 dragstart 이벤트에서만 접근 가능
      // 타입 정보를 dataTransfer에 저장하고, 나중에 읽을 수 있도록 함
      const target = e.target as HTMLElement;
      if (target && target.hasAttribute('data-type-id')) {
        const typeId = parseInt(target.getAttribute('data-type-id') || '0', 10);
        setDraggingTypeId(typeId);
      }
    };

    const handleDragEnd = () => {
      setDraggingTypeId(null);
    };

    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  });

  // 드롭 영역 위에 있을 때 (타입 확인)
  const createHandleDragOver = (holeType: string) => (e: DragEvent) => {
    const expectedTypeId = holeTypeToTypeId[holeType];
    const currentDraggingTypeId = draggingTypeId();
    
    // 타입이 일치하는 경우에만 드롭 허용
    if (currentDraggingTypeId === expectedTypeId) {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    } else {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'none';
      }
    }
  };

  // 드롭 처리
  const createHandleDrop = (holeType: string) => (e: DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer?.getData('application/json');
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        const expectedTypeId = holeTypeToTypeId[holeType];
        // 타입이 일치하는 경우에만 드롭 처리
        if (data.typeId === expectedTypeId) {
          const current = droppedTypes();
          setDroppedTypes({
            ...current,
            [holeType]: {
              partUrl: data.partUrl,
              typeName: data.typeName,
              features: data.features || [],
            }
          });
          
          // 스토어에 저장
          const features = (data.features || []).filter((f: string | null) => f !== null) as string[];
          switch (holeType) {
            case 'role':
              setRoleFeatures(features);
              break;
            case 'function':
              setFunctionFeatures(features);
              break;
            case 'tone':
              setToneFeatures(features);
              break;
            case 'rule':
              setRuleFeatures(features);
              break;
            case 'tool':
              setToolFeatures(features);
              break;
          }
          
          // 드롭 완료 후 하이라이트 제거
          if (highlightedHole() === holeType) {
            setHighlightedHole(null);
          }
          
          // AiFunction의 다음 탭으로 이동
          if (aiFunctionMoveToNextTab) {
            aiFunctionMoveToNextTab();
          }

          // 모든 타입이 완료되었는지 확인
          checkAllTypesCompleted();
        }
      } catch (error) {
        console.error('Failed to parse drop data:', error);
      }
    }
  };

  // 모든 타입이 완료되었는지 확인
  const checkAllTypesCompleted = () => {
    const elements = aiAssistantElements;
    const allCompleted = 
      elements.role.length > 0 &&
      elements.function.length > 0 &&
      elements.tone.length > 0 &&
      elements.rule.length > 0 &&
      elements.tool.length > 0;
    
    if (allCompleted && currentStep() === 'building') {
      setCurrentStep('completion');
    }
  };

  // 각 step에 따라 다른 화면 렌더링
  return (
    <Show when={isReady()} fallback={<LoadingSpinner />}>
      <Show when={currentStep() === 'building'}>
        <div class={`${pageContainerStyles.container} ${styles.container}`} 
             style={{"background-color": "#BCCAFF"}}>
          <div class={styles.contentWrapper}>
           <div class={styles.spanWrapper}><span>실습 : AI 비서 만들기</span></div>
            <Show when={!showAiStudio()}>
              <img src={getS3ImageURL('4-2/presentHoldingMai.png')} class={styles.maiImage} />
              <div class={styles.maiImageWrapper}>
                <SpeechBubble message={typingAnimation.displayedMessage()} size={600} />
              </div>
              <Show when={isTypingComplete()}>
                <div class={styles.buttonWrapper}>
                  <ConfirmButton onClick={goToNextStep} text="응, 좋아!" />
                </div>
              </Show>
            </Show>
            <Show when={showAiStudio()}>
            <div class={styles.aiStudioWrapper}>
              <AiFunction 
                onSelectionChange={handleSelectionChange}
                onMoveToNextTab={handleMoveToNextTabCallback}
                onSelectionStateChange={handleSelectionStateChange}
              />
              <div class={styles.aiStudioImageWrapper}>
                <img src={getS3ImageURL('4-2/aiAssistant.png')} class={styles.aiStudioImage} />
              </div>
              <div
                class={`${styles.dragDropItem} ${styles.roleHole} ${highlightedHole() === 'role' ? styles.holeHighlighted : ''}`}
                onDragOver={createHandleDragOver('role')}
                onDrop={createHandleDrop('role')}
              >
                {getHoleImage('role')}
              </div>
              <div
                class={`${styles.dragDropItem} ${styles.functionHole} ${highlightedHole() === 'function' ? styles.holeHighlighted : ''}`}
                onDragOver={createHandleDragOver('function')}
                onDrop={createHandleDrop('function')}
              >
                {getHoleImage('function')}
              </div>
              <div
                class={`${styles.dragDropItem} ${styles.toneHole} ${highlightedHole() === 'tone' ? styles.holeHighlighted : ''}`}
                onDragOver={createHandleDragOver('tone')}
                onDrop={createHandleDrop('tone')}
              >
                {getHoleImage('tone')}
              </div>
              <div
                class={`${styles.dragDropItem} ${styles.ruleHole} ${highlightedHole() === 'rule' ? styles.holeHighlighted : ''}`}
                onDragOver={createHandleDragOver('rule')}
                onDrop={createHandleDrop('rule')}
              >
                {getHoleImage('rule')}
              </div>
              <div
                class={`${styles.dragDropItem} ${styles.toolHole} ${highlightedHole() === 'tool' ? styles.holeHighlighted : ''}`}
                onDragOver={createHandleDragOver('tool')}
                onDrop={createHandleDrop('tool')}
              >
                {getHoleImage('tool')}
              </div>
            </div>
            </Show>
          </div>
        </div>
      </Show>
      
      <Show when={currentStep() === 'completion'}>
        <CompletionConfirmation onNext={() => setCurrentStep('nameInput')} />
      </Show>
      
      <Show when={currentStep() === 'nameInput'}>
        <NameInput onNameSubmit={(name) => {
          setAiAssistantName(name);
          setCurrentStep('introduction');
        }} />
      </Show>
      
      <Show when={currentStep() === 'introduction'}>
        <Introduction 
          aiAssistantName={aiAssistantName()} 
          onNext={() => setCurrentStep('testing')} 
        />
      </Show>
      
      <Show when={currentStep() === 'testing'}>
        <TestInterface 
          aiAssistantName={aiAssistantName()} 
          onComplete={() => {
            navigate('/4/2/5');
          }}
        />
      </Show>
    </Show>
  );
};

export default MakingOwnAiAssistant;

