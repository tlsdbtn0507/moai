export type AiAssistantType = {
    id: number;
    name: string;
    features: string[];
    color:string;
    partUrl:string;
}

export type AiAssistantElements = {
    role:string[];
    function:string[];
    tone:string[];
    rule:string[];
    tool:string[];
}


export const AI_ASSISTANT_TYPES = [
    {
        id: 1,
        name: '역할',
        features: [
            '✏️  숙제 도우미',
            '✔️ 공부 플래너',
            '💡 아이디어 메이커',
            '💛감정 코치',
            '✍️ 글쓰기 코치',
            '🤔 고민 상담 메이트',
            '📝 시험 대비 분석가',
            '⌨️ 직접 입력',
        ],
        color: '#F89B9B',
        partUrl: '4-2/rolePart.png',
    },
    {
        id: 2,
        name: '기능',
        features: [
            '📝 할 일 목록 만들기',
            '🔍 예시 만들어주기',
            '✂️ 글 요약하기',
            '✏️ 문장 다듬기',
            '📅 일정 알려주기',
            '🔢 단계별로 나누어 설명하기',
            '💬 설명해주기',
            '⌨️ 직접 입력',
        ],
        color:'#72E7FB',
        partUrl: '4-2/functionPart.png',
    },
    {
        id: 3,
        name: '말투',
        features: [
            '☕ 차분형',
            '😎  친구형',
            '💪 응원형',
            '🎉 유머형',
            '💗 귀여운형',
            '🧠 논리형',
            '⚡️ 단호형',
            '⌨️ 직접 입력',
        ],
        color:'#77FFD2',
        partUrl: '4-2/tonePart.png',
    },
    {
        id: 4,
        name: '규칙',
        features: [
            '❓ 모르면 솔직히 말하기',
            '🎯️ 핵심 먼저 말하기',
            '🔒 개인정보 묻지 않기',
            '📌 필요한 정보만 정확히 말하기',
            '🔄 애매하면 다시 확인하기',
            '🔍 예시 먼저 제시하기',
            '✂️ 짧고 간단하게 말하기',
            '⌨️ 직접 입력',
        ],
        color:'#FFFFA8',
        partUrl: '4-2/rulePart.png',
    },
    {
        id: 5,
        name: '도구',
        features: [
            '⏱️ 타이머',
            '🙂 감정 체크',
            '📝 메모장',
            '🧮 계산기',
            '☑️ 할 일 리스트',
            '📚 스크랩북',
            '📅 시간표 관리',
            '✏️ 맞춤법 검사기',
        ],
        color:'#DDBDFD',
        partUrl: '4-2/toolPart.png',
    }
]