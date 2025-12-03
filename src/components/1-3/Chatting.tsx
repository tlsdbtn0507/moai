import { For, createSignal, createEffect, Show } from 'solid-js';
import styles from './Chatting.module.css';
import { getS3ImageURL } from '../../utils/loading';
import { callGPT4Mini, getValidationPrompt, getCompletionMessage } from '../../utils/gptChat';
import { generateImageFromPrompt } from '../../utils/gptImage';
import { useCharacterImageStore } from '../../store/1/3/characterImageStore';
import { LoadingModal } from './modal/LoadingModal';

type MessageType = 'ai' | 'user';

type Message = {
    id: number;
    type: MessageType;
    text: string;
};

type AvatarOption = {
    id: number;
    name: string;
    image: string;
};

type ChattingProps = {
    selectedOption: AvatarOption;
    allOptions: AvatarOption[];
    onCharacterGenerated?: (imageUrl: string) => void;
    onLoadingChange?: (isLoading: boolean) => void;
    onCompletedOptionsChange?: (completedIds: number[]) => void;
};

const getInitialMessage = (optionId: number): string => {
    switch (optionId) {
        case 1: // 얼굴
            return '표정, 피부색, 눈 형태를 포함해서 캐릭터 얼굴을 설명해봐!';
        case 2: // 옷
            return '상의와 하의의 종류, 색깔, 그리고 무늬나 특징을 포함해서\n캐릭터의 옷을 설명해봐!';
        case 3: // 장신구
            return '장신구가 있다면 종류, 색깔, 특징이나 위치를 포함해서 설명해줘!\n(없으면 \'없음\'이라고 말해도 돼)';
        default:
            return '';
    }
};

const Chatting = (props: ChattingProps) => {
    const [messages, setMessages] = createSignal<Message[]>([]);
    const [inputValue, setInputValue] = createSignal('');
    const [lastOptionId, setLastOptionId] = createSignal<number | null>(null);
    const [isLoading, setIsLoading] = createSignal(false);
    const [completedOptions, setCompletedOptions] = createSignal<number[]>([]);
    
    // 묘사 객체 저장
    const [descriptions, setDescriptions] = createSignal<{
        얼굴?: string;
        옷?: string;
        장신구?: string;
    }>({});
    
    // 이미지 생성 상태
    const [isGenerating, setIsGenerating] = createSignal(false);
    
    // 모든 옵션이 완료되었는지 확인
    const isAllOptionsCompleted = () => {
        return completedOptions().length === props.allOptions.length;
    };
    
    // 옵션별 대화 히스토리 캐시
    const conversationCache = new Map<number, Message[]>();
    
    let inputRef: HTMLInputElement | undefined;
    let messagesContainerRef: HTMLDivElement | undefined;

    // 스크롤을 맨 아래로 이동
    const scrollToBottom = () => {
        if (messagesContainerRef) {
            setTimeout(() => {
                messagesContainerRef!.scrollTop = messagesContainerRef!.scrollHeight;
            }, 0);
        }
    };

    // 묘사 객체 생성 및 콘솔 출력
    const createAndLogDescription = (optionId: number, userMessages: Message[]) => {
        const optionNames: Record<number, string> = {
            1: '얼굴',
            2: '옷',
            3: '장신구'
        };
        const optionName = optionNames[optionId];
        
        // 현재 옵션의 모든 사용자 입력을 합쳐서 묘사 생성
        const descriptionText = userMessages
            .filter(m => m.type === 'user')
            .map(m => m.text)
            .join(' ');
        
        // 묘사 객체 업데이트
        const newDescriptions = {
            ...descriptions(),
            [optionName]: descriptionText
        };
        setDescriptions(newDescriptions);
        
        // 콘솔에 출력
        console.log('캐릭터 묘사 객체:', newDescriptions);
    };
    
    // 캐릭터 이미지 생성
    const handleGenerateCharacter = async () => {
        const desc = descriptions();
        const faceDesc = desc.얼굴 || '';
        const clothesDesc = desc.옷 || '';
        const accessoryDesc = desc.장신구 || '';
        
        // 묘사 객체를 하나의 프롬프트로 합치기
        let prompt = '캐릭터 디자인: ';
        if (faceDesc) prompt += `얼굴: ${faceDesc}. `;
        if (clothesDesc) prompt += `옷: ${clothesDesc}. `;
        if (accessoryDesc && !accessoryDesc.includes('없음') && !accessoryDesc.includes('없어')) {
            prompt += `장신구: ${accessoryDesc}.`;
        }
        
        setIsGenerating(true);
        
        try {
            const imageUrl = await generateImageFromPrompt(prompt);
            
            // zustand 스토어에 프롬프트와 이미지 URL 저장 (이미지 생성 성공 후)
            const { setPrompt: setStorePrompt, setGeneratedImageUrl: setStoreImageUrl } = useCharacterImageStore.getState();
            setStorePrompt(prompt);
            setStoreImageUrl(imageUrl);
            
            // 부모 컴포넌트에 이미지 생성 완료 알림
            if (props.onCharacterGenerated) {
                props.onCharacterGenerated(imageUrl);
            }
        } catch (error) {
            console.error('이미지 생성 오류:', error);
            alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsGenerating(false);
        }
    };

    // 선택된 옵션이 변경될 때마다 초기 메시지 설정
    createEffect(() => {
        const option = props.selectedOption;
        const currentOptionId = option.id;
        const previousOptionId = lastOptionId();
        
        // 이전 옵션의 대화 히스토리를 캐시에 저장
        if (previousOptionId !== null && previousOptionId !== currentOptionId) {
            const currentMessages = messages();
            if (currentMessages.length > 0) {
                conversationCache.set(previousOptionId, currentMessages);
            }
        }
        
        // 옵션이 변경되었을 때만 초기화
        if (previousOptionId !== currentOptionId) {
            // 캐시에서 기존 대화 히스토리 불러오기
            const cachedMessages = conversationCache.get(currentOptionId);
            
            if (cachedMessages && cachedMessages.length > 0) {
                // 캐시된 대화가 있으면 복원
                setMessages(cachedMessages);
            } else {
                // 캐시된 대화가 없으면 초기 메시지 설정
                const initialMessage = getInitialMessage(currentOptionId);
                
                // 완료된 옵션이 아닌 경우에만 초기 메시지 표시
                if (!completedOptions().includes(currentOptionId)) {
                    setMessages([{
                        id: 1,
                        type: 'ai',
                        text: initialMessage
                    }]);
                } else {
                    // 이미 완료된 경우 완료 메시지만 표시
                    const completionMsg = getCompletionMessage(currentOptionId, props.allOptions, completedOptions());
                    setMessages([{
                        id: 1,
                        type: 'ai',
                        text: completionMsg
                    }]);
                }
            }
            setLastOptionId(currentOptionId);
            scrollToBottom();
        }
    });

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
        
        // 현재 옵션의 대화 히스토리 업데이트
        conversationCache.set(props.selectedOption.id, newMessages);
        
        // 스크롤을 맨 아래로 이동
        scrollToBottom();
    };

    const handleSendMessage = async () => {
        const text = inputValue().trim();
        if (!text || isLoading()) return;

        // 입력 필드 초기화
        setInputValue('');
        
        // 이미 완료된 옵션이면 검증 건너뛰기
        if (completedOptions().includes(props.selectedOption.id)) {
            addMessage(text, 'user');
            if (inputRef) {
                inputRef.focus();
            }
            return;
        }

        // 유저 메시지 추가
        const currentMessages = messages();
        const maxId = currentMessages.length > 0 
            ? Math.max(...currentMessages.map(m => m.id))
            : 0;
        
        const newUserMessage: Message = {
            id: maxId + 1,
            type: 'user',
            text: text
        };
        
        const updatedMessages = [...currentMessages, newUserMessage];
        setMessages(updatedMessages);
        conversationCache.set(props.selectedOption.id, updatedMessages);
        scrollToBottom();

        setIsLoading(true);
        if (props.onLoadingChange) {
            props.onLoadingChange(true);
        }

        try {
            // 필수 항목 검증 (전체 대화 맥락 포함)
            const allUserInputs = updatedMessages
                .filter(m => m.type === 'user')
                .map(m => m.text)
                .join(' ');
            
            const validationPrompt = getValidationPrompt(props.selectedOption.id, allUserInputs);
            
            // ERROR 응답 처리 (옷 없음 등)
            if (validationPrompt.startsWith('ERROR:')) {
                const errorMessage = validationPrompt.replace('ERROR:', '').trim();
                addMessage(errorMessage, 'ai');
                setIsLoading(false);
                if (props.onLoadingChange) {
                    props.onLoadingChange(false);
                }
                if (inputRef) {
                    inputRef.focus();
                }
                return;
            }
            
            if (validationPrompt === 'COMPLETE') {
                // 장신구가 없음으로 처리 완료
                if (!completedOptions().includes(props.selectedOption.id)) {
                    const newCompletedOptions = [...completedOptions(), props.selectedOption.id];
                    setCompletedOptions(newCompletedOptions);
                    if (props.onCompletedOptionsChange) {
                        props.onCompletedOptionsChange(newCompletedOptions);
                    }
                    // 완료 메시지 생성 (현재 완료된 옵션 목록 포함)
                    const completionMsg = getCompletionMessage(props.selectedOption.id, props.allOptions, completedOptions());
                    addMessage(completionMsg, 'ai');
                    
                    // 묘사 객체 생성 및 콘솔 출력
                    createAndLogDescription(props.selectedOption.id, updatedMessages);
                }
                
                setIsLoading(false);
                if (props.onLoadingChange) {
                    props.onLoadingChange(false);
                }
                if (inputRef) {
                    inputRef.focus();
                }
                return;
            }

            // 채팅 히스토리 생성 (초기 AI 메시지 제외하고 모든 대화 포함)
            const conversationMessages = updatedMessages
                .filter(m => !(m.type === 'ai' && m.id === 1))
                .map(m => ({
                    role: (m.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                    content: m.text
                }));

            const optionNames = {
                1: '얼굴',
                2: '옷',
                3: '장신구'
            };
            const currentOptionName = optionNames[props.selectedOption.id as keyof typeof optionNames];
            
            let systemContent = `한국어로 답변하는 친근한 AI입니다. "${currentOptionName}" 설명을 검증 중입니다. 해당 옵션의 필수 항목만 검증하고, 다른 옵션 항목은 검증하지 마세요. 이전 대화를 참고하여 맥락을 이해하고 답변하세요. 누락된 항목이 있을 때는 항목명과 함께 구체적인 예시를 반드시 포함해서 질문하세요.`;
            
            // 얼굴 옵션인 경우 맥락 이해 강화
            if (props.selectedOption.id === 1) {
                systemContent += ` "노란 얼굴 빛" 등 유사 표현도 피부색으로 인식하세요.`;
            }
            
            // 옷 옵션인 경우 맥락 이해 강화
            if (props.selectedOption.id === 2) {
                systemContent += ` "레더 재킷", "브이넥 티셔츠" 등은 명백히 상의 종류가 있는 것입니다. 글의 의미를 정확히 파악하세요.`;
            }
            
            // 장신구 옵션인 경우 특징 인식 강화
            if (props.selectedOption.id === 3) {
                systemContent += ` "평범한", "심플한" 등의 표현도 특징으로 인식하세요.`;
            }
            
            const chatHistory = [
                {
                    role: 'system' as const,
                    content: systemContent
                },
                // 전체 대화 히스토리 포함
                ...conversationMessages,
                {
                    role: 'user' as const,
                    content: validationPrompt
                }
            ];

            // GPT API 호출
            const gptResponse = await callGPT4Mini(chatHistory);
            const normalizedResponse = gptResponse.trim().toUpperCase();
            
            // 디버깅: GPT 응답 로그
            console.log('GPT 응답:', gptResponse);
            console.log('정규화된 응답:', normalizedResponse);
            
            // 완료를 의미하는 키워드들
            const completionKeywords = ['COMPLETE', '완료', '넘어가자', '넘어가', '다음으로'];
            const isComplete = normalizedResponse === 'COMPLETE' || 
                             normalizedResponse.startsWith('COMPLETE') ||
                             completionKeywords.some(keyword => normalizedResponse.includes(keyword.toUpperCase())) ||
                             gptResponse.includes('완료') ||
                             gptResponse.includes('넘어가자');
            
            console.log('완료 여부:', isComplete);
            console.log('이미 완료된 옵션:', completedOptions());

                if (isComplete) {
                // 필수 항목이 모두 채워짐
                // 완료 처리 및 묘사 객체 생성
                if (!completedOptions().includes(props.selectedOption.id)) {
                    console.log('완료 처리 시작:', props.selectedOption.id);
                    const newCompletedOptions = [...completedOptions(), props.selectedOption.id];
                    setCompletedOptions(newCompletedOptions);
                    if (props.onCompletedOptionsChange) {
                        props.onCompletedOptionsChange(newCompletedOptions);
                    }
                    // 완료 메시지 생성 (현재 완료된 옵션 목록 포함)
                    const completionMsg = getCompletionMessage(props.selectedOption.id, props.allOptions, completedOptions());
                    addMessage(completionMsg, 'ai');
                    
                    // 묘사 객체 생성 및 콘솔 출력
                    createAndLogDescription(props.selectedOption.id, updatedMessages);
                } else {
                    console.log('이미 완료된 옵션:', props.selectedOption.id);
                }
            } else {
                // 필수 항목이 누락됨
                addMessage(gptResponse, 'ai');
            }
        } catch (error) {
            console.error('GPT API 오류:', error);
            addMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.', 'ai');
        } finally {
            setIsLoading(false);
            if (props.onLoadingChange) {
                props.onLoadingChange(false);
            }
            if (inputRef) {
                inputRef.focus();
            }
        }
    };

    return (
        <div class={styles.chattingWrapper}>
            <div class={styles.chatMessages} ref={messagesContainerRef}>
                <For each={messages()}>
                    {(message) => (
                        <div class={styles.messageWrapper} classList={{ [styles.userMessage]: message.type === 'user' }}>
                            {message.type === 'ai' && (
                                <div class={styles.aiAvatar}>
                                    <img 
                                        src={getS3ImageURL('1-3/chatMaiFace.png')} 
                                        alt="Mai Avatar" 
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
                                src={getS3ImageURL('1-3/chatMaiFace.png')} 
                                alt="Mai Avatar" 
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
            <div class={styles.chatInputContainer}>
                <input
                    ref={inputRef}
                    type="text"
                    class={styles.chatInput}
                    value={inputValue()}
                    onInput={(e) => setInputValue(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.isComposing && !isLoading()) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="메시지를 입력하세요"
                    disabled={isLoading()}
                />
                <button 
                    class={styles.sendButton}
                    onClick={handleSendMessage}
                    disabled={isLoading()}
                >
                    입력
                </button>
            </div>
            
            {/* 모든 옵션이 완료되었을 때만 버튼 표시 */}
            <Show when={isAllOptionsCompleted()}>
                <div class={styles.generateButtonContainer}>
                    <button 
                        class={styles.generateButton}
                        onClick={handleGenerateCharacter}
                        disabled={isGenerating()}
                    >
                        {isGenerating() ? '생성 중...' : '캐릭터 생성하기'}
                    </button>
                </div>
            </Show>
            
            {/* 로딩 모달 */}
            <LoadingModal isOpen={isGenerating()} />
        </div>
    );
};

export default Chatting;

