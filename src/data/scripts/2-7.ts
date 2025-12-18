
import { type JSX, type Component } from 'solid-js';

interface IntroScript {
    id: number;
    script: string;
    content: string | JSX.Element | Component;
    bgPng: string;
    voiceUrl: string;
    isBgFaded: boolean;
    isSpeechBubble: boolean;
}

type titleSection = {
    title: string;
    description: string;
}

interface ConceptScript {
    id: number;
    script:string;
    titleSection : null | titleSection;
    contentPic : null | string;
    voiceUrl: string;
    maiPic : string;
}

interface PracticeScript {
    id: number;
    script: string;
    maiPic:string;
    isSpeechBubbleBig:boolean;
    chatPng:null | string;
    voiceUrl: string;
}

interface FeedbackScript {
    id: number;
    script: string;
    maiPic:string;
    voiceUrl: string;
}

export const introScripts: IntroScript[] = [
    {
        id: 1,
        script: '안녕! 지금 숙제하는 중이구나?\n보자... 사회 과제 자료 찾고 있네.',
        content: '2-7/glimpsingMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_1.mp3',
        isBgFaded: false,
        isSpeechBubble: true,
    },
    {
        id: 2,
        script: '오, ‘중학생 스마트폰 사용 시간’...  AI가 바로 답을 줬네?',
        content: '',
        bgPng: '2-7/chattingDesk.png',
        voiceUrl: '2-7/2-7_intro_2.mp3',
        isBgFaded: false,
        isSpeechBubble: false,
    },
    {
        id: 3,
        script: '하루에 3시간이라... 말투가 아주 그럴듯한데?',
        content: '',
        bgPng: '2-7/chattingDesk.png',
        voiceUrl: '2-7/2-7_intro_3.mp3',
        isBgFaded: false,
        isSpeechBubble: false,
    },
    {
        id: 4,
        script:'근데 있지... 이게 진짜 조사에서\n나온 수치인지 확인해본 적 있어?',
        content: '2-7/quriousMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_4.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    },
    {
        id: 5,
        script: '좋아. 간단한 실험을 하나 해보자. 지금부터\n 너도 AI처럼 그럴듯한 문장을 만들어보는 거야.',
        content: '2-7/oustretchedMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_5.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    },

    {
        id: 6,
        script: '방금 너가 만든 문장말야... 진짜 누군가가\n연구해서 쓴 문장 같아!',
        content: '2-7/oustretchedMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_6.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    },
    {
        id: 7,
        script: '근데 혹시 만들기 전에\n‘진짜 조사 결과’를 찾아보고 쓴 건 아니지?',
        content: '2-7/magnifyingMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_7.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    },
    {
        id: 8,
        script: '내가 두 가지 문장을 보여줄게\n한 번 읽고 이상한 점을 찾아볼래?',
        content: '2-7/stickMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_8.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    },
    {
        id: 9,
        script: '두 문장 다 아주 자연스러워.\n근데 서로 말이 완전 반대이지?',
        content: '2-7/oustretchedMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_9.mp3',
        isBgFaded: true,
        isSpeechBubble: true,  
    },
    {
        id: 10,
        script: '이게 바로 포인트야. 자연스럽게 말하는 것과\n정확한 정보를 말하는 것은 전혀 다른 문제야.',
        content: '2-7/worriedMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_10.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    },
    {
        id: 11,
        script: '그리고 AI도 대부분 방금 너처럼\n‘자연스럽게 들리는 문장’을 우선해서 만들어.',
        content: '2-7/worriedMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_11.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    },
    {
        id: 12,
        script: '그러면 왜 이런 일이 생기는지\n그 원리와 해결방안을 알려줄게.',
        content: '2-7/bulbMai.png',
        bgPng: '2-7/desk.png',
        voiceUrl: '2-7/2-7_intro_12.mp3',
        isBgFaded: true,
        isSpeechBubble: true,
    }
];

export const conceptScripts: ConceptScript[] = [
    {
        id: 1,
        script: 'AI는 <strong>답할 때마다 검색을 하는 게 아니야.</strong>\n자료를 가져올 때도 있지만, 대부분 이런 식으로 말해.',
        titleSection: { title: 'AI는 •••', description: '데이터를 가져오는 게 아니라 ‘<strong>예측해서 만든다</strong>’' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_1.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 2,
        script: '이 단어 뒤에 사람들이 보통 어떤 말을 붙였지?',
        titleSection: { title: 'AI는 •••', description: "데이터를 가져오는 게 아니라 ‘<strong>예측해서 만든다</strong>’" },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_2.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 3,
        script: '이걸 계산해서 <strong>가장 자연스러운\n다음 문장</strong>을 만드는 게 AI의 기본 방식이야.',
        titleSection: { title: 'AI는 •••', description: "데이터를 가져오는 게 아니라 ‘<strong>예측해서 만든다</strong>’" },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_3.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 4,
        script: "예를 들어 ‘중학생·평균·스마트폰 사용’ 같은\n단어들이 보이면, AI는 딱 이렇게 반응해.",
        titleSection: { title: 'AI는 •••', description: '비슷한 단어만 보여도 <strong>엉뚱한 정보</strong>가 섞여 나올 수 있다.' },
        contentPic: '2-7/aiRobot.png',
        voiceUrl: '2-7/2-7_development_4.mp3',
        maiPic: '2-7/magnifyingMai.png',
    },
    {
        id: 5,
        script: '음... 이거\n예전에 읽었던 뉴스 문장에도 있었던 표현인데?',
        titleSection: { title: 'AI는 •••', description: '비슷한 단어만 보여도 <strong>엉뚱한 정보</strong>가 섞여 나올 수 있다.' },
        contentPic: '2-7/robot1.png',
        voiceUrl: '2-7/2-7_development_5.mp3',
        maiPic: '2-7/magnifyingMai.png',
    },
    {
        id: 6,
        script: '그리고 비슷한 키워드가 들어간 글에서도\n이런 말투가 자주 나왔지.',
        titleSection: { title: 'AI는 •••', description: '비슷한 단어만 보여도 <strong>엉뚱한 정보</strong>가 섞여 나올 수 있다.' },
        contentPic: '2-7/robot2.png',
        voiceUrl: '2-7/2-7_development_6.mp3',
        maiPic: '2-7/magnifyingMai.png',
    },
    {
        id: 7,
        script: '설문조사 결과나 누가 썼던 리포트 문장도\n이런 구조였던 것 같고',
        titleSection: { title: 'AI는 •••', description: '비슷한 단어만 보여도 <strong>엉뚱한 정보</strong>가 섞여 나올 수 있다.' },
        contentPic: '2-7/robot3.png',
        voiceUrl: '2-7/2-7_development_7.mp3',
        maiPic: '2-7/magnifyingMai.png',
    },
    {
        id: 8,
        script: '패턴이 비슷한 다른 문장들도 있으니까…\n좋아, 이런 식으로 이어가면 자연스럽겠다!',
        titleSection: { title: 'AI는 •••', description: '비슷한 단어만 보여도 <strong>엉뚱한 정보</strong>가 섞여 나올 수 있다.' },
        contentPic: '2-7/robot4.png',
        voiceUrl: '2-7/2-7_development_8.mp3',
        maiPic: '2-7/magnifyingMai.png',
    },
    {
        id: 9,
        script: '이렇게 여러 조각을 뒤섞어서\n<strong>가장 그럴듯한 문장</strong>을 만들어내는 거야.',
        titleSection: { title: 'AI는 •••', description: '비슷한 단어만 보여도 <strong>엉뚱한 정보</strong>가 섞여 나올 수 있다.' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_9.mp3',
        maiPic: '2-7/magnifyingMai.png',
    },
    {
        id: 10,
        script: "AI는 ‘음… 아마…’ 같은 망설이는 말투가 없어.\n항상 매끄럽게, 확신 있게 말하지.",
        titleSection: { title: 'AI는 •••', description: '말투는 자신감 넘치지만, <strong>내용은 틀릴 수 있다</strong>' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_10.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 11,
        script: "하지만 <strong>자연스러움</strong> = <strong>정확함은 절대 아니야.</strong>\n두 능력은 완전히 다른거거든.",
        titleSection: { title: 'AI는 •••', description: '말투는 자신감 넘치지만, <strong>내용은 틀릴 수 있다</strong>' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_11.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 12,
        script: 'AI는 도대체 어디까지 진짜로 알고 있고,\n어디서부터는 그럴듯하게 꾸며낸 건지 구분이 잘 안 돼.',
        titleSection: { title: 'AI는 •••', description: '말투는 자신감 넘치지만, <strong>내용은 틀릴 수 있다</strong>' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_12.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 13,
        script: '그래서 확신 있게 말하더라도\n<strong>사실이 아닐 수 있다는 점</strong>을 항상 기억해야 해.',
        titleSection: { title: 'AI는 •••', description: '말투는 자신감 넘치지만, <strong>내용은 틀릴 수 있다</strong>' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_13.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 14,
        script: '겉보기에 논리적이고 설득력 있어 보인다고 해서,\n그게 진실이라는 뜻은 아니거든.',
        titleSection: { title: 'AI는 •••', description: '말투는 자신감 넘치지만, <strong>내용은 틀릴 수 있다</strong>' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_14.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 15,
        script: '출처도 조심해야 해.',
        titleSection: { title: 'AI는 •••', description: '출처도 모양만 보고 만들어낼 수 있다.' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_15.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 16,
        script: 'AI가 이런 그럴듯한 출처 형식을 배워서,\n<strong>실제로 존재하지 않는 문서</strong>도\n자연스럽게 만들어낼 수 있어.',
        titleSection: { title: 'AI는 •••', description: '출처도 모양만 보고 만들어낼 수 있다.' },
        contentPic: '2-7/reportText.png',
        voiceUrl: '2-7/2-7_development_16.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 17,
        script: '겉보기엔 믿음직해 보여도\n<strong>실제 자료인지 꼭 확인</strong>해야 해.',
        titleSection: { title: 'AI는 •••', description: '출처도 모양만 보고 만들어낼 수 있다.' },
        contentPic: '2-7/reportText.png',
        voiceUrl: '2-7/2-7_development_17.mp3',
        maiPic: '2-7/stickMai.png',
    },
    {
        id: 18,
        script: '결국 정답은 이거야.',
        titleSection: { title: '그래서', description: '<strong>최종 결정</strong>은 사람이 해야만 한다!' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_18.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 19,
        script: 'AI는 <strong>자연스러운 문장</strong>을 만들고,\n사람은 <strong>사실 여부</strong>를 확인한다. ',
        titleSection: { title: '그래서', description: '<strong>최종 결정</strong>은 사람이 해야만 한다!' },
        contentPic: '2-7/robotAndMan.png',
        voiceUrl: '2-7/2-7_development_19.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 20,
        script: '이 두 역할이 맞아야 정확한 정보를 쓸 수 있어.',
        titleSection: { title: '그래서', description: '<strong>최종 결정</strong>은 사람이 해야만 한다!' },
        contentPic: '2-7/connected.png',
        voiceUrl: '2-7/2-7_development_20.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 21,
        script: 'AI가 제시한 정보가 정확한지 판별하는 건\n생각보다 어려운 일이 아니야.',
        titleSection: { title: '그래서', description: '<strong>최종 결정</strong>은 사람이 해야만 한다!' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_21.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 22,
        script: '딱 5가지만 보면 돼.',
        titleSection: null,
        contentPic: '2-7/texts.png',
        voiceUrl: '2-7/2-7_development_22.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 23,
        script: '이 5가지만 체크해도, AI가 말한 정보가\n어느 정도 믿을 만한지 아닌지 바로 감이 잡혀.',
        titleSection: null,
        contentPic: '2-7/texts.png',
        voiceUrl: '2-7/2-7_development_23.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 24,
        script: '중요한 건 완벽하게 검증하는 게 아니라,\n의심해야 할 부분을 빠르게 찾아내는 능력을 갖추는 거야.',
        titleSection: null,
        contentPic: '2-7/texts.png',
    voiceUrl: '2-7/2-7_development_24.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 25,
        script: 'AI는 도움을 주는 도구일 뿐,\n<strong>최종 판단은 항상 사람</strong>이 직접 내려야 해.',
        titleSection: null,
        contentPic: '2-7/texts.png',
        voiceUrl: '2-7/2-7_development_25.mp3',
        maiPic: '2-7/reportingMai.png',
    },
    {
        id: 26,
        script: 'AI는 패턴을 예측해서 자연스럽게 말하고,\n그래서 틀린 말도 자신 있게 제시할 수 있어.',
        titleSection: { title: '결론', description: '단계별로 검증하기' },
        contentPic: null,
        voiceUrl: '2-7/2-7_development_26.mp3',
        maiPic: '2-7/bulbMai.png',
    },
    {
        id: 27,
        script: '그래서 항상 위의 5단계를 통해 검증을 해봐야해.',
        titleSection: null,
        contentPic: '2-7/verifingContent.png',
        voiceUrl: '2-7/2-7_development_27.mp3',
        maiPic: '2-7/bulbMai.png',
    },
    {
        id: 28,
        script: '좋아! 이제 원리도 알았으니까\n직접 AI가 어디서 실수하는지 찾아보자!',
        titleSection: null,
        contentPic: '2-7/verifingContent.png',
        voiceUrl: '2-7/2-7_development_28.mp3',
        maiPic: '2-7/bulbMai.png',
    },
]

export const practiceScripts: PracticeScript[] = [
    {
        id: 1,
        script:'이제 실습을 한번 시작해보자.\nAI가 자연스럽게  말하더라도\n질문을 제대로 안 읽고 대답할 때가 많거든.',
        maiPic: '2-7/presentHoldingMai.png',
        isSpeechBubbleBig: true,
        chatPng: null,
        voiceUrl: '2-7/2-7_practice_1.mp3',
    },
    {
        id: 2,
        script: '그걸 직접 잡아내고, 또 그 실수를 안하게\n만드는 질문을 만들어볼거야.',
        maiPic: '2-7/presentHoldingMai.png',
        isSpeechBubbleBig: true,
        chatPng: null,
        voiceUrl: '2-7/2-7_practice_2.mp3',
    },
    {
        id: 3,
        script: '겉보기엔 자연스럽지만\n잘 보면 많이 달라\nAI가 놓친 조건들이 뭐가 있을까?',
        maiPic: '2-7/magnifyingMaiR.png',
        isSpeechBubbleBig: false,
        chatPng: '2-7/chatInterface.png',
        voiceUrl: '2-7/2-7_practice_3.mp3',
    },
    {
        id: 4,
        script: '잘했어! AI는 단어만 비슷하면\n전체 데이터나 다른 정보를\n가져올 때가 있어',
        maiPic: '2-7/magnifyingMaiR.png',
        isSpeechBubbleBig: false,
        chatPng: '2-7/chatInterface.png',
        voiceUrl: '2-7/2-7_practice_4.mp3',
    },
    {
        id:5,
        script: '그럼 이제 AI가 틀리지 않게\n정확한 질문을 만드는 방법을 실습해보자!',
        maiPic: '2-7/presentHoldingMai.png',
        isSpeechBubbleBig: true,
        chatPng: null,
        voiceUrl: '2-7/2-7_practice_5.mp3',
    },
    {
        id: 6,
        script: '오늘 숙제할때 했던 질문을 살펴보자.\n궁금한 마음은 알겠는데\n이건 AI에게 너무 막연한 질문이야.',
        maiPic: '2-7/strangingMai.png',
        isSpeechBubbleBig: false,
        chatPng: '2-7/chatAlone.png',
        voiceUrl: '2-7/2-7_practice_6.mp3',
    },
    {
        id: 7,
        script: '얼마나가 하루인지, 주간인지도\n모르고, 중1만 말하는지 전부\n말하는 건지도 모르잖아?',
        maiPic: '2-7/strangingMai.png',
        isSpeechBubbleBig: false,
        chatPng: '2-7/chatAlone.png',
        voiceUrl: '2-7/2-7_practice_7.mp3',
    },
    {
        id: 8,
        script: '오른쪽의 체크리스트 항목을 보고\n전부 반영한 질문으로 바꿔보자!',
        maiPic: '2-7/strangingMai.png',
        isSpeechBubbleBig: false,
        chatPng: '2-7/chatAlone.png',
        voiceUrl: '2-7/2-7_practice_8.mp3',
    },
    {
        id: 9,
        script:"잘했어! 이제 이런  질문을 하며\nAI가 조건을 놓치지 않고\n정확하게 답할 확률이 훨씬 높아져!",
        maiPic: '2-7/presentHoldingMai.png',
        isSpeechBubbleBig: true,
        chatPng: null,
        voiceUrl: '2-7/2-7_practice_9.mp3',
    },
    {
        id: 10,
        script: '정확한 질문의 핵심은 다음과 같아.\n언제, 누구, 어디, 어떤 방식, 출처 요청!',
        maiPic: '2-7/bulbMai.png',
        isSpeechBubbleBig: true,
        chatPng: null,
        voiceUrl: '2-7/2-7_practice_10.mp3',
    },
    {
        id: 11,
        script: '이 다섯 가지를 넣으면 AI가 자연스럽게\n틀려버릴 가능성을 확 줄일 수 있어!',
        maiPic: '2-7/presentHoldingMai.png',
        isSpeechBubbleBig: true,
        chatPng: null,
        voiceUrl: '2-7/2-7_practice_11.mp3',
    },
    
]

export const feedbackScripts: FeedbackScript[] = [
    {
        id: 1,
        script: '오늘 배운 내용을 정리해볼까?',
        maiPic: '2-7/oustretchedMai.png',
        voiceUrl: '2-7/2-7_closing_1.mp3',
    },
    {
        id: 2,
        script: 'AI가 자연스럽게 말하더라도\n질문을 제대로 안 읽고 대답할 때가 많거든.',
        maiPic: '2-7/jumpingMai.png',
        voiceUrl: '2-7/2-7_closing_2.mp3',
    },
    {
        id: 3,
        script: '배운 것을 잘 활용하면 AI에게 훨씬\n더 효과적으로 질문할 수 있을 거야!',
        maiPic: '2-7/jumpingMai.png',
        voiceUrl: '2-7/2-7_closing_3.mp3',
    },
    {
        id: 4,
        script: '다음 시간에는 지금까지 배운 걸 바탕으로\n네 AI 도우미를 직접 만들어볼 거야!',
        maiPic: '2-7/reportingMai.png',
        voiceUrl: '2-7/2-7_closing_4.mp3',
    },
    {
        id: 5,
        script: '그럼 다음 시간에 다시 만나자!',
        maiPic: '2-7/byeMai.png',
        voiceUrl: '2-7/2-7_closing_5.mp3',
    }
]

