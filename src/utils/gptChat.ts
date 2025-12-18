const OPENAI_CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

type ChatMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

type ChatCompletionResponse = {
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
    }>;
};

export async function callGPT4Mini(messages: ChatMessage[]): Promise<string> {
    const apiKey = import.meta.env.VITE_GPT_API_KEY;
    if (!apiKey) {
        throw new Error('VITE_GPT_API_KEY가 설정되지 않았습니다.');
    }

    const response = await fetch(OPENAI_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-5-mini',
            messages: messages,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GPT API 호출 실패: ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const message = data.choices?.[0]?.message?.content;

    if (!message) {
        throw new Error('GPT 응답에서 메시지를 가져오지 못했습니다.');
    }

    return message.trim();
}

// 필수 항목 검증을 위한 시스템 프롬프트 생성 (토큰 최적화)
export function getValidationPrompt(optionId: number, userInput: string): string {
    const optionLabels: Record<number, string> = {
        1: '얼굴',
        2: '옷',
        3: '장신구',
    };

    // 장신구가 없으면 완료 처리
    if (optionId === 3) {
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('없음') || lowerInput.includes('없어') || lowerInput.includes('없')) {
            return 'COMPLETE';
        }
    }

    // 옷 옵션: 옷을 안 입히려는 시도 차단 (하의만 없음은 허용)
    if (optionId === 2) {
        const lowerInput = userInput.toLowerCase();
        
        // 허용할 표현 (하의만 없는 경우)
        const allowedPhrases = ['바지', '하의', '치마', '팬츠'];
        const hasAllowedPhrase = allowedPhrases.some(phrase => 
            lowerInput.includes(phrase) && (lowerInput.includes('없') || lowerInput.includes('안'))
        );
        
        // 옷 전체를 없애려는 시도 차단
        if (!hasAllowedPhrase) {
            const noClothesKeywords = [
                '옷 없음', '옷 없어', '옷 안입', '옷 안 입', '옷 패스', '옷 스킵',
                '의상 없음', '상의 없음', '상의 없어', '옷 없이'
            ];
            
            for (const keyword of noClothesKeywords) {
                if (lowerInput.includes(keyword)) {
                    return `ERROR: 캐릭터는 반드시 옷을 입어야 합니다. 옷 없이는 불가능해요. 상의와 하의를 포함해서 옷을 설명해주세요!`;
                }
            }
        }
    }

    const validationContexts: Record<number, string> = {
        1: `✅ 얼굴 설명 검증 규칙:

- 필수 포함 요소:
  1) 표정 (예: 웃는, 미소, 화난)
  2) 피부색 (예: 노란 얼굴빛, 검은 피부 등)
  3) 눈 형태 (예: 동그란 눈, 세로로 긴 눈 등)

- 유사 표현도 포함된 것으로 간주:
  * '노란 피부', '노란 얼굴', '노란 얼굴빛', '노란 얼굴색' = 피부색 포함
  * '웃는', '미소', '심각한 표정' 등 = 표정 포함
  * '동그란 눈', '큰 눈' 등 = 눈 형태 포함

- 모든 항목이 포함되었으면 'COMPLETE'만 출력
- 누락된 항목이 있다면 누락된 항목명과 함께 구체적인 예시를 제시하고 친절하게 질문
  예: "표정이 누락되었습니다. 표정은 어떻게 할까요? (예: 웃는, 미소, 화난 등)"
- 피부색, 표정, 눈 형태 외의 항목은 검증하지 말 것
`,

        2: `✅ 옷 설명 검증 규칙:

- 필수 포함 요소:
  1) 상의 종류 (예: 재킷, 티셔츠, 셔츠, 후드티, 블라우스 등)
  2) 상의 색상 (예: 흰색, 파란색 등)
  3) 하의 종류 (예: 바지, 치마, 팬츠 등)
  4) 하의 색상 (예: 검정, 회색 등)
  5) 무늬/특징 (예: 로고, 줄무늬 등)

- 상의 종류 인식 예시:
  * "레더 재킷" = 상의 종류 있음 (재킷) ✓
  * "브이넥 티셔츠" = 상의 종류 있음 (티셔츠) ✓
  * "셔츠", "후드티", "블라우스", "재킷", "티셔츠", "코트" 등 = 상의 종류 있음 ✓

- 상의는 필수, 하의는 선택적
  * "하의 없음", "바지 안입음" 등은 허용됨
  * "상의 없음"은 허용되지 않음 → 오류 메시지 출력

- 모든 필수 항목이 포함되었으면 반드시 정확히 'COMPLETE'라고만 출력 (다른 텍스트 없이)
- 누락된 항목이 있다면 해당 항목명과 함께 구체적인 예시를 제시하고 친절하게 질문
  예: "상의 색이 누락되었습니다. 상의 색은 어떻게 할까요? (예: 흰색, 파란색, 빨간색 등)"
- 옷 관련 항목 외의 항목(피부색, 표정 등)은 검증하지 말 것
- 글의 의미를 정확히 파악하세요.
`,

        3: `✅ 장신구 설명 검증 규칙:

- 필수 요소:
  1) 종류 (예: 안경, 반지)
  2) 색상 (예: 은색, 금색 등)
  3) 위치 (예: 머리, 귀, 목 등)
  4) 특징 (예: 반짝이는, 고급스러운, 평범한, 심플한 등)

- 유사 표현도 포함된 것으로 간주:
  * '평범한', '심플한', '단순한', '일반적인' = 특징 포함
  * '반짝이는', '고급스러운', '화려한' = 특징 포함

- 사용자가 "없음", "없어" 등을 입력했을 경우 = 'COMPLETE'

- 모든 필수 항목이 포함되었으면 다음으로 넘어가자!
- 누락된 항목이 있다면 해당 항목명과 함께 구체적인 예시를 제시하고 친근하게 질문
  예: "특징이 누락되었어. 장신구의 특징은 뭐야? (예: 반짝이는, 고급스러운, 평범한, 심플한 등)"
`,
    };

    const description = optionLabels[optionId];
    const rules = validationContexts[optionId];

    return `사용자가 캐릭터의 [${description}]을(를) 설명하고 있음.

⚡ 사용자 입력:
"${userInput}"

${rules}`;
}

// 완료 메시지 생성
export function getCompletionMessage(
    optionId: number, 
    allOptions: Array<{id: number, name: string}>,
    completedOptions: number[]
): string {
    const optionNames: Record<number, string> = {
        1: '얼굴',
        2: '옷',
        3: '장신구'
    };

    const currentOptionName = optionNames[optionId];
    
    // 현재 완료된 옵션들을 포함한 새로운 완료 목록
    const newCompletedOptions = [...completedOptions, optionId];
    
    // 모든 옵션이 완료되었는지 확인
    const allOptionsCompleted = allOptions.every(opt => newCompletedOptions.includes(opt.id));
    
    if (allOptionsCompleted) {
        return '모든 입력이 완료되었어! 캐릭터 묘사 완료! 🎉';
    }

    return `${currentOptionName} 입력이 완료되었어!\n이제 다른 요소를 입력하자!`;
}

// 프롬프트 평가 타입
export type PromptScores = {
    specificity: number; // 구체성 (1-3)
    clarity: number; // 명확성 (1-3)
    contextuality: number; // 맥락성 (1-3)
    feedback: {
        specificity: string; // 구체성 피드백
        clarity: string; // 명확성 피드백
        contextuality: string; // 맥락성 피드백
    };
};

/**
 * 프롬프트를 평가하여 구체성, 명확성, 맥락성을 점수로 반환
 * @param sunsetPrompt 노을 풍경 묘사 프롬프트
 * @param characterPrompt 캐릭터 묘사 프롬프트 (얼굴, 옷, 장신구 포함)
 * @returns 평가 점수 객체
 */
export async function evaluatePrompts(
    sunsetPrompt: string,
    characterPrompt: string
): Promise<PromptScores> {
    const evaluationPrompt = `다음 두 프롬프트를 평가해주세요.

1. 노을 풍경 묘사:
"${sunsetPrompt}"

2. 캐릭터 묘사:
"${characterPrompt}"

각 프롬프트를 다음 세 가지 기준으로 평가해주세요:
- 구체성 (Specificity): 구체적인 세부사항이 얼마나 포함되어 있는가? (2점: 보통, 3점: 매우 구체적) - 최소 2점부터 시작
- 명확성 (Clarity): AI가 이해하기 쉬운가? (2점: 보통, 3점: 매우 명확) - 최소 2점부터 시작
- 맥락성 (Contextuality): 맥락과 상황이 잘 전달되는가? (2점: 보통, 3점: 맥락 풍부) - 최소 2점부터 시작

참고: 점수는 2점 또는 3점만 부여해주세요. 1점은 거의 주지 않도록 해주세요.

각 항목에 대해 점수와 함께 친근하고 격려하는 톤의 피드백을 작성해주세요.
**중요: 각 피드백은 반드시 4줄 이하로 간결하게 작성해주세요.**
피드백 형식 예시:
- 구체성이 낮을 때: "캐릭터의 외형·능력·아이템 정보가 부족해요! 어떤 모습인지 더 자세히 말해주면 훨씬 정확해져요."
- 명확성이 낮을 때: "하고 싶은 말은 잘 전해졌지만, '귀여운/친절한' 같은 표현이 조금 모호해요. 구체적인 단어로 바꾸면 이해도 UP!"
- 맥락성이 낮을 때: "이 캐릭터가 어디에 쓰이는지가 빠져 있어요. 상황이나 목적을 한 줄 추가하면 캐릭터가 더 선명해져요!"
점수가 높을 때는 칭찬하는 피드백을 작성해주세요.

응답 형식은 반드시 다음 JSON 형식으로만 답변해주세요:
{
  "sunset": {
    "specificity": 1-3,
    "clarity": 1-3,
    "contextuality": 1-3,
    "feedback": {
      "specificity": "구체성에 대한 피드백 (친근하고 격려하는 톤)",
      "clarity": "명확성에 대한 피드백 (친근하고 격려하는 톤)",
      "contextuality": "맥락성에 대한 피드백 (친근하고 격려하는 톤)"
    }
  },
  "character": {
    "specificity": 1-3,
    "clarity": 1-3,
    "contextuality": 1-3,
    "feedback": {
      "specificity": "구체성에 대한 피드백 (친근하고 격려하는 톤)",
      "clarity": "명확성에 대한 피드백 (친근하고 격려하는 톤)",
      "contextuality": "맥락성에 대한 피드백 (친근하고 격려하는 톤)"
    }
  }
}

두 프롬프트의 평균 점수를 계산하고, 피드백도 두 프롬프트를 종합하여 작성해주세요.`;

    try {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: '당신은 프롬프트 평가 전문가입니다. 주어진 프롬프트를 객관적이고 정확하게 평가합니다. 반드시 JSON 형식으로만 응답합니다.',
            },
            {
                role: 'user',
                content: evaluationPrompt,
            },
        ];

        const response = await callGPT4Mini(messages);
        
        // 출력 검증 (내부 평가 함수이므로 입력은 안전하다고 가정)
        const moderationResult = await checkContentSafety(response);
        const validatedResponse = moderationResult.isSafe 
            ? response 
            : '{"sunset":{"specificity":2,"clarity":2,"contextuality":2,"feedback":{"specificity":"구체적인 세부사항을 더 추가해보면 좋아요!","clarity":"표현을 더 명확하게 하면 이해도가 올라가요!","contextuality":"상황이나 맥락을 추가하면 더 완벽해져요!"}},"character":{"specificity":2,"clarity":2,"contextuality":2,"feedback":{"specificity":"구체적인 세부사항을 더 추가해보면 좋아요!","clarity":"표현을 더 명확하게 하면 이해도가 올라가요!","contextuality":"상황이나 맥락을 추가하면 더 완벽해져요!"}}}';
        
        // JSON 파싱 시도
        let parsedResponse: {
            sunset?: { 
                specificity: number; 
                clarity: number; 
                contextuality: number;
                feedback?: {
                    specificity: string;
                    clarity: string;
                    contextuality: string;
                };
            };
            character?: { 
                specificity: number; 
                clarity: number; 
                contextuality: number;
                feedback?: {
                    specificity: string;
                    clarity: string;
                    contextuality: string;
                };
            };
        };
        
        try {
            // JSON 코드 블록 제거
            const jsonMatch = validatedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                parsedResponse = JSON.parse(validatedResponse);
            }
        } catch (parseError) {
            // 기본값 반환
            return { 
                specificity: 2, 
                clarity: 2, 
                contextuality: 2,
                feedback: {
                    specificity: '구체적인 세부사항을 더 추가해보면 좋아요!',
                    clarity: '표현을 더 명확하게 하면 이해도가 올라가요!',
                    contextuality: '상황이나 맥락을 추가하면 더 완벽해져요!'
                }
            };
        }

        // 두 프롬프트의 평균 계산
        const sunsetScores = parsedResponse.sunset || { 
            specificity: 2, 
            clarity: 2, 
            contextuality: 2,
            feedback: {
                specificity: '구체적인 세부사항을 더 추가해보면 좋아요!',
                clarity: '표현을 더 명확하게 하면 이해도가 올라가요!',
                contextuality: '상황이나 맥락을 추가하면 더 완벽해져요!'
            }
        };
        const characterScores = parsedResponse.character || { 
            specificity: 2, 
            clarity: 2, 
            contextuality: 2,
            feedback: {
                specificity: '구체적인 세부사항을 더 추가해보면 좋아요!',
                clarity: '표현을 더 명확하게 하면 이해도가 올라가요!',
                contextuality: '상황이나 맥락을 추가하면 더 완벽해져요!'
            }
        };

        // 평균 점수 계산
        const avgSpecificity = Math.round((sunsetScores.specificity + characterScores.specificity) / 2);
        const avgClarity = Math.round((sunsetScores.clarity + characterScores.clarity) / 2);
        const avgContextuality = Math.round((sunsetScores.contextuality + characterScores.contextuality) / 2);

        // 점수가 1이면 2로 올리고, 2-3 범위로 조정 (1점은 거의 주지 않음)
        const specificity = Math.max(2, Math.min(3, avgSpecificity < 2 ? 2 : avgSpecificity));
        const clarity = Math.max(2, Math.min(3, avgClarity < 2 ? 2 : avgClarity));
        const contextuality = Math.max(2, Math.min(3, avgContextuality < 2 ? 2 : avgContextuality));

        // 피드백 통합 (두 프롬프트의 피드백을 종합)
        const sunsetFeedback = sunsetScores.feedback || {
            specificity: '구체적인 세부사항을 더 추가해보면 좋아요!',
            clarity: '표현을 더 명확하게 하면 이해도가 올라가요!',
            contextuality: '상황이나 맥락을 추가하면 더 완벽해져요!'
        };
        const characterFeedback = characterScores.feedback || {
            specificity: '구체적인 세부사항을 더 추가해보면 좋아요!',
            clarity: '표현을 더 명확하게 하면 이해도가 올라가요!',
            contextuality: '상황이나 맥락을 추가하면 더 완벽해져요!'
        };

        // 피드백 통합 (점수가 낮은 쪽의 피드백 우선, 둘 다 높으면 칭찬)
        const getCombinedFeedback = (
            sunsetScore: number,
            characterScore: number,
            sunsetFeedback: string,
            characterFeedback: string,
            highScoreMessage: string
        ): string => {
            if (sunsetScore >= 3 && characterScore >= 3) {
                return highScoreMessage;
            }
            // 점수가 낮은 쪽의 피드백 우선
            if (sunsetScore <= characterScore) {
                return sunsetFeedback || characterFeedback;
            } else {
                return characterFeedback || sunsetFeedback;
            }
        };

        const combinedFeedback = {
            specificity: getCombinedFeedback(
                sunsetScores.specificity,
                characterScores.specificity,
                sunsetFeedback.specificity,
                characterFeedback.specificity,
                '구체적인 묘사가 잘 되어 있어요!'
            ),
            clarity: getCombinedFeedback(
                sunsetScores.clarity,
                characterScores.clarity,
                sunsetFeedback.clarity,
                characterFeedback.clarity,
                '명확한 표현이 좋아요!'
            ),
            contextuality: getCombinedFeedback(
                sunsetScores.contextuality,
                characterScores.contextuality,
                sunsetFeedback.contextuality,
                characterFeedback.contextuality,
                '맥락이 잘 전달되고 있어요!'
            )
        };

        const scores: PromptScores = {
            specificity,
            clarity,
            contextuality,
            feedback: combinedFeedback
        };

        return scores;
    } catch (error) {
        // 기본값 반환
        return { 
            specificity: 2, 
            clarity: 2, 
            contextuality: 2,
            feedback: {
                specificity: '구체적인 세부사항을 더 추가해보면 좋아요!',
                clarity: '표현을 더 명확하게 하면 이해도가 올라가요!',
                contextuality: '상황이나 맥락을 추가하면 더 완벽해져요!'
            }
        };
    }
}

// ==================== AI 방화벽 기능 ====================

const MODERATION_ENDPOINT = 'https://api.openai.com/v1/moderations';

/**
 * Moderation API를 사용하여 콘텐츠 안전성 검증
 * @param content 검증할 콘텐츠
 * @returns 검증 결과
 */
export async function checkContentSafety(content: string): Promise<{
    isSafe: boolean;
    flagged: boolean;
    categories?: Record<string, boolean>;
    categoryScores?: Record<string, number>;
}> {
    const apiKey = import.meta.env.VITE_GPT_API_KEY;
    if (!apiKey) {
        throw new Error('VITE_GPT_API_KEY가 설정되지 않았습니다.');
    }

    try {
        const response = await fetch(MODERATION_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                input: content,
                model: 'omni-moderation-latest', // 최신 모더레이션 모델
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Moderation API 호출 실패:', errorText);
            // 에러 발생 시 안전을 위해 차단
            return {
                isSafe: false,
                flagged: true,
            };
        }

        const data = await response.json();
        const result = data.results[0];

        return {
            isSafe: !result.flagged,
            flagged: result.flagged,
            categories: result.categories,
            categoryScores: result.category_scores,
        };
    } catch (error) {
        console.error('Moderation API 에러:', error);
        // 에러 발생 시 안전을 위해 차단
        return {
            isSafe: false,
            flagged: true,
        };
    }
}

/**
 * 사용자 입력 검증 (1단계: Moderation API)
 * @param userInput 사용자 입력
 * @returns 검증 결과 및 안전한 메시지
 */
export async function validateUserInput(userInput: string): Promise<{
    isValid: boolean;
    message: string;
}> {
    const moderationResult = await checkContentSafety(userInput);

    if (!moderationResult.isSafe) {
        return {
            isValid: false,
            message: '죄송합니다. 부적절한 내용이 감지되었습니다. 교육 목적에 맞는 질문을 해주세요.',
        };
    }

    return {
        isValid: true,
        message: userInput,
    };
}

/**
 * AI 응답 검증 (출력 방화벽)
 * @param aiResponse AI 응답
 * @param maxRetries 최대 재시도 횟수
 * @returns 검증된 안전한 응답 또는 차단 메시지
 */
export async function validateAIResponse(
    aiResponse: string,
    maxRetries: number = 3
): Promise<{
    isValid: boolean;
    safeResponse: string;
}> {
    const moderationResult = await checkContentSafety(aiResponse);

    if (moderationResult.isSafe) {
        return {
            isValid: true,
            safeResponse: aiResponse,
        };
    }

    // 부적절한 응답이 감지된 경우
    console.warn('부적절한 AI 응답 감지:', {
        flagged: moderationResult.flagged,
        categories: moderationResult.categories,
    });

    return {
        isValid: false,
        safeResponse: '죄송합니다. 적절하지 않은 응답이 생성되었습니다. 다른 질문을 해주시겠어요?',
    };
}

/**
 * 안전한 GPT 호출 (입력 및 출력 모두 검증)
 * @param messages 대화 메시지 배열
 * @param options 옵션 설정
 * @returns 안전한 AI 응답
 */
export async function callGPT4MiniWithSafety(
    messages: ChatMessage[],
    options: {
        skipInputValidation?: boolean; // 입력 검증 스킵 (시스템 메시지 등)
        skipOutputValidation?: boolean; // 출력 검증 스킵
        maxRetries?: number; // 최대 재시도 횟수
    } = {}
): Promise<string> {
    const {
        skipInputValidation = false,
        skipOutputValidation = false,
        maxRetries = 3,
    } = options;

    // 1단계: 사용자 입력 검증 (마지막 user 메시지만 검증)
    if (!skipInputValidation) {
        const lastUserMessage = messages
            .slice()
            .reverse()
            .find((msg) => msg.role === 'user');

        if (lastUserMessage) {
            const inputValidation = await validateUserInput(lastUserMessage.content);
            if (!inputValidation.isValid) {
                throw new Error(inputValidation.message);
            }
        }
    }

    // 2단계: GPT API 호출
    let aiResponse: string | undefined = undefined;
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            aiResponse = await callGPT4Mini(messages);
            break;
        } catch (error) {
            attempts++;
            if (attempts >= maxRetries) {
                throw error;
            }
            // 재시도 전 잠시 대기
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
    }

    if (aiResponse === undefined || aiResponse === null) {
        throw new Error('AI 응답을 받지 못했습니다.');
    }

    // 3단계: AI 응답 검증 (출력 방화벽)
    if (!skipOutputValidation) {
        const outputValidation = await validateAIResponse(aiResponse, maxRetries);
        return outputValidation.safeResponse;
    }

    return aiResponse;
}

