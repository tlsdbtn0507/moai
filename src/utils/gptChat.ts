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
    
    // 아직 완료되지 않은 옵션들 찾기
    const remainingOptions = allOptions
        .filter(opt => !newCompletedOptions.includes(opt.id))
        .map(opt => {
            // 조사 처리: 받침이 있으면 '을', 없으면 '를'
            const lastChar = opt.name[opt.name.length - 1];
            const hasFinalConsonant = (lastChar.charCodeAt(0) - 0xAC00) % 28 !== 0;
            return hasFinalConsonant ? `${opt.name}을` : `${opt.name}를`;
        });

    // 모든 옵션이 완료되었는지 확인
    if (remainingOptions.length === 0) {
        return '모든 입력이 완료되었어! 캐릭터 묘사 완료! 🎉';
    }

    const remainingOptionsText = remainingOptions.join(', ');
    return `${currentOptionName} 입력이 완료되었어! 이제 ${remainingOptionsText} 클릭해서 입력하자!`;
}

