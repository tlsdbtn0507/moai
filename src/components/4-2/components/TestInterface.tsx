import { createSignal, createMemo, Show, For, createEffect } from 'solid-js';
import { getS3ImageURL } from '../../../utils/loading';
import styles from './TestInterface.module.css';
import pageContainerStyles from '../../../styles/PageContainer.module.css';
import { aiAssistantElements } from '../../../store/4/aiAssistantElementStore';
import { AI_ASSISTANT_TYPES } from '../../../data/aiAssistantTypes';
import { callGPT4MiniWithSafety } from '../../../utils/gptChat';

interface TestInterfaceProps {
  aiAssistantName: string;
  onComplete: () => void;
}

type MessageType = 'ai' | 'user';

type Message = {
  id: number;
  type: MessageType;
  text: string;
};

// 더미 데이터 생성 함수
const createDummyData = () => {
  return {
    role: ['✔️ 공부 플래너', '💛감정 코치','📝 시험 대비 분석가'],
    function: ['📝 할 일 목록 만들기', '🔍 예시 만들어주기'],
    tone: ['😎 친구형'],
    rule: ['❓ 모르면 솔직히 말하기'],
    tool: ['⏱️ 타이머', '📝 메모장'],
  };
};

const TestInterface = (props: TestInterfaceProps) => {
  const [activeTab, setActiveTab] = createSignal<'role' | 'function' | 'tone' | 'rule' | 'tool'>('role');
  const [userInput, setUserInput] = createSignal('');
  const [showHint, setShowHint] = createSignal(false);
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  
  let messagesContainerRef: HTMLDivElement | undefined;

  // 스토어에서 데이터 가져오기, 없으면 더미 데이터 사용
  const getStoreData = () => {
    const storeData = aiAssistantElements;
    const hasData = 
      storeData.role.length > 0 ||
      storeData.function.length > 0 ||
      storeData.tone.length > 0 ||
      storeData.rule.length > 0 ||
      storeData.tool.length > 0;
    
    return hasData ? storeData : createDummyData();
  };

  const assistantData = createMemo(() => getStoreData());
  const displayName = createMemo(() => {
    const name = props.aiAssistantName || '테스트 비서';
    return name;
  });

  // AI 비서 시스템 프롬프트 생성
  const createSystemPrompt = () => {
    const data = assistantData();
    const name = displayName();
    
    // 이모지 제거하고 텍스트만 추출
    const cleanFeature = (feature: string) => {
      return feature.replace(/^[^\s]+\s/, '').trim();
    };

    let prompt = `당신은 "${name}"이라는 이름의 AI 비서입니다. 사용자가 설정한 다음 조건에 따라 대화하세요:\n\n`;

    // 역할 설정
    if (data.role && data.role.length > 0) {
      prompt += `**역할:**\n`;
      data.role.forEach(role => {
        prompt += `- ${cleanFeature(role)}\n`;
      });
      prompt += '\n';
    }

    // 기능 설정
    if (data.function && data.function.length > 0) {
      prompt += `**기능:**\n`;
      data.function.forEach(func => {
        prompt += `- ${cleanFeature(func)}\n`;
      });
      prompt += '\n';
    }

    // 말투 설정
    if (data.tone && data.tone.length > 0) {
      prompt += `**말투:**\n`;
      data.tone.forEach(tone => {
        const cleanTone = cleanFeature(tone);
        prompt += `- ${cleanTone}\n`;
        
        // 말투에 따른 구체적인 지시
        if (cleanTone.includes('친구형')) {
          prompt += '  → 반말을 사용하고 친근하고 편안한 톤으로 대화하세요.\n';
        } else if (cleanTone.includes('차분형')) {
          prompt += '  → 차분하고 안정적인 톤으로 대화하세요.\n';
        } else if (cleanTone.includes('응원형')) {
          prompt += '  → 격려하고 응원하는 톤으로 대화하세요.\n';
        } else if (cleanTone.includes('유머형')) {
          prompt += '  → 유머러스하고 재미있는 톤으로 대화하세요.\n';
        } else if (cleanTone.includes('귀여운형')) {
          prompt += '  → 귀엽고 사랑스러운 톤으로 대화하세요.\n';
        } else if (cleanTone.includes('논리형')) {
          prompt += '  → 논리적이고 체계적인 톤으로 대화하세요.\n';
        } else if (cleanTone.includes('단호형')) {
          prompt += '  → 단호하고 명확한 톤으로 대화하세요.\n';
        }
      });
      prompt += '\n';
    }

    // 규칙 설정
    if (data.rule && data.rule.length > 0) {
      prompt += `**규칙:**\n`;
      data.rule.forEach(rule => {
        prompt += `- ${cleanFeature(rule)}\n`;
      });
      prompt += '\n';
    }

    // 도구 설정
    if (data.tool && data.tool.length > 0) {
      prompt += `**사용 가능한 도구:**\n`;
      data.tool.forEach(tool => {
        prompt += `- ${cleanFeature(tool)}\n`;
      });
      prompt += '\n';
    }

    prompt += `위 조건들을 모두 준수하며 사용자와 대화하세요. 자연스럽고 친근하게 응답하되, 설정된 역할과 기능에 맞게 도움을 제공하세요.`;

    return prompt;
  };

  const tabs = [
    { id: 'role' as const, label: '역할', typeId: 1 },
    { id: 'function' as const, label: '기능', typeId: 2 },
    { id: 'tone' as const, label: '말투', typeId: 3 },
    { id: 'rule' as const, label: '규칙', typeId: 4 },
    { id: 'tool' as const, label: '도구', typeId: 5 },
  ];

  // 현재 활성 탭의 타입 정보 가져오기
  const currentTabType = createMemo(() => {
    const tab = tabs.find(t => t.id === activeTab());
    return AI_ASSISTANT_TYPES.find(type => type.id === tab?.typeId) || AI_ASSISTANT_TYPES[0];
  });

  // 현재 탭의 features 가져오기
  const currentTabFeatures = createMemo(() => {
    return assistantData()[activeTab()] || [];
  });

  // 기능 버튼들 (function 타입의 features)
  const functionFeatures = createMemo(() => {
    return assistantData().function || [];
  });

  // 탭 색상 가져오기
  const getTabColor = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return '#E0E0E0';
    const type = AI_ASSISTANT_TYPES.find(t => t.id === tab.typeId);
    return type?.color || '#E0E0E0';
  };

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    if (messagesContainerRef) {
      setTimeout(() => {
        messagesContainerRef!.scrollTop = messagesContainerRef!.scrollHeight;
      }, 0);
    }
  };

  // 메시지 추가 함수
  const addMessage = (text: string, type: MessageType) => {
    const currentMessages = messages();
    const maxId = currentMessages.length > 0 
      ? Math.max(...currentMessages.map(m => m.id))
      : 0;
    
    const newMessages = [...currentMessages, {
      id: maxId + 1,
      type: type,
      text: text
    }];
    
    setMessages(newMessages);
    scrollToBottom();
  };

  const handleInput = async (e?: Event) => {
    if (e) {
      e.preventDefault();
    }
    
    const text = userInput().trim();
    if (!text || isLoading()) return;

    // 입력 필드 초기화
    setUserInput('');
    
    // 사용자 메시지 추가
    addMessage(text, 'user');
    
    setIsLoading(true);
    
    try {
      // 대화 히스토리 생성
      const conversationHistory = messages()
        .filter(m => m.type !== 'user' || m.text !== text) // 현재 메시지 제외
        .map(m => ({
          role: m.type === 'user' ? 'user' as const : 'assistant' as const,
          content: m.text
        }));

      // 시스템 프롬프트 생성
      const systemPrompt = createSystemPrompt();

      // GPT API 호출
      const chatMessages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        ...conversationHistory,
        {
          role: 'user' as const,
          content: text
        }
      ];

      const response = await callGPT4MiniWithSafety(chatMessages);
      addMessage(response, 'ai');
    } catch (error) {
      console.error('GPT API 호출 오류:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.';
      addMessage(errorMessage, 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint());
  };

  // 초기 메시지 설정
  createEffect(() => {
    if (messages().length === 0) {
      addMessage('안녕하세요! 저는 ' + displayName() + '입니다. 질문이나 입력을 통해 저를 확인해보세요.', 'ai');
    }
  });

  return (
    <div class={`${pageContainerStyles.container} ${styles.container}`} 
         style={{"background-color": "#BCCAFF"}}>
      <div class={styles.contentWrapper}>
        {/* 상단 헤더 */}
        <div class={styles.header}>
          <div class={styles.titleWrapper}>
            <span>실습: AI 비서 테스트하기</span>
          </div>
          <button class={styles.completeButton} onClick={props.onComplete}>
            <span class={styles.checkIcon}>✓</span>
            <span>테스트 완료</span>
          </button>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div class={styles.mainContent}>
          {/* 왼쪽 섹션: AI 비서 프로필 */}
          <div class={styles.leftSection}>
            {/* 탭 메뉴 */}
            <div class={styles.tabsContainer}>
              {tabs.map((tab) => {
                const tabColor = getTabColor(tab.id);
                const isActive = activeTab() === tab.id;
                return (
                  <button
                    class={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={isActive ? { 'background-color': tabColor } : {}}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* AI 비서 아바타 */}
            <div class={styles.avatarBorderContainer}>
              <div class={styles.avatarSection}>
                <img 
                  src={getS3ImageURL('4-2/completedAssistant.png')} 
                  class={styles.avatar} 
                  alt="AI 비서 아바타"
                />
                <div class={styles.nameDisplay}>
                  이름 : {displayName()}
                </div>
              </div>

              {/* 탭 내용 영역 */}
              <div class={styles.tabContent}>
                <div class={styles.featuresList}>
                  {currentTabFeatures().length > 0 ? (
                    currentTabFeatures().map((feature) => (
                      <div 
                        class={styles.featureItem}
                        style={{ 'background-color': currentTabType().color }}
                      >
                        {feature}
                      </div>
                    ))
                  ) : (
                    <div class={styles.noFeature}>설정된 항목이 없습니다</div>
                  )}
                </div>
              </div>

              {/* 기능 선택 버튼들 */}
              {/* <div class={styles.functionButtons}>
                {functionFeatures().length > 0 ? (
                  functionFeatures().map((func) => {
                    const functionType = AI_ASSISTANT_TYPES.find(t => t.id === 2);
                    const buttonColor = functionType?.color || '#FFB6C1';
                    // 이모지와 텍스트 분리
                    const cleanText = func.replace(/^[^\s]+\s/, '');
                    return (
                      <button 
                        class={styles.functionButton}
                        style={{ 'background-color': buttonColor }}
                      >
                        <span class={styles.checkIcon}>✓</span>
                        <span>{cleanText}</span>
                      </button>
                    );
                  })
                ) : (
                  <>
                    <button 
                      class={styles.functionButton}
                      style={{ 'background-color': '#72E7FB' }}
                    >
                      <span class={styles.checkIcon}>✓</span>
                      <span>공부 플래너</span>
                    </button>
                    <button 
                      class={styles.functionButton}
                      style={{ 'background-color': '#72E7FB' }}
                    >
                      <span class={styles.heartIcon}>♥</span>
                      <span>감정 코치</span>
                    </button>
                  </>
                )}
              </div> */}
            </div>
          </div>

          {/* 오른쪽 섹션: 테스트 인터페이스 */}
          <div class={styles.rightSection}>

            {/* 대화창 영역 */}
            <div class={styles.chatMessages} ref={messagesContainerRef}>
              <For each={messages()}>
                {(message) => (
                  <div 
                    class={styles.messageWrapper} 
                    classList={{ [styles.userMessage]: message.type === 'user' }}
                  >
                    {message.type === 'ai' && (
                      <div class={styles.aiAvatar}>
                        <img 
                          src={getS3ImageURL('4-2/aiChatProfile.png')} 
                          alt="AI 비서 아바타" 
                          class={styles.aiAvatarImg}
                        />
                      </div>
                    )}
                    <div 
                      class={styles.messageBubble}
                      classList={{ 
                        [styles.aiBubble]: message.type === 'ai',
                        [styles.userBubble]: message.type === 'user'
                      }}
                    >
                      {message.text}
                    </div>
                  </div>
                )}
              </For>
              <Show when={isLoading()}>
                <div class={styles.messageWrapper}>
                  <div class={styles.aiAvatar}>
                    <img 
                      src={getS3ImageURL('4-2/aiChatProfile.png')} 
                      alt="AI 비서 아바타" 
                      class={styles.aiAvatarImg}
                    />
                  </div>
                  <div 
                    class={styles.messageBubble}
                    classList={{ 
                      [styles.aiBubble]: true
                    }}
                  >
                    <div class={styles.typingIndicator}>
                      <span class={styles.typingText}>답변 중</span>
                      <span class={styles.typingDots}>
                        <span class={styles.typingDot}></span>
                        <span class={styles.typingDot}></span>
                        <span class={styles.typingDot}></span>
                      </span>
                    </div>
                  </div>
                </div>
              </Show>
            </div>

            {/* 사용자 입력 힌트 */}
            <Show when={showHint()}>
              <div class={styles.hintBox}>
                <span>기능에 맞는 질문을 통해 확인해보세요 <br /> ex) 공부 플래너 선택시 '중간고사 계획 세워줘'</span>
              </div>
            </Show>

            {/* 입력 영역 */}
            <div style={{display: "flex",
              'align-items': "center",
              'justify-content': "space-between"}}>
            <form class={styles.inputArea} onSubmit={handleInput}>
              <input
                type="text"
                class={styles.inputField}
                value={userInput()}
                onInput={(e) => setUserInput(e.currentTarget.value)}
                placeholder="하고 싶은 말을 입력하여 비서를 확인해보세요"
                disabled={isLoading()}
              />
              <button 
                type="submit"
                class={styles.inputButton} 
                disabled={isLoading()}
              >
                입력
              </button>
            </form>
              <button 
                type="button"
                class={styles.helpButton} 
                onClick={toggleHint}
              >
                <span>?</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInterface;
