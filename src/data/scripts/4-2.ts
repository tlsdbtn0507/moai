interface IntroductionScriptInterface {
  id: number;
  script: string;
  voice: string;
  maiPng:string;
  bgPng:string;
  speechBubble:boolean
  scriptBgLine:boolean;
}

interface CompareStepInterface {
    id: number;
    content:CompareStepScriptInterface;
    summary: string;
    bgPng:string;
}

interface ConceptScriptInterface {
    id: number;
    activity:string;
    content:string;
    script:string;
    voice:string;
    maiPng:string;
    isMaiRight:boolean;
}

export interface CompareStepScriptInterface {
  id: number;
  questionScript: string;
  smartie:string[];
  kylie:string[];
  logos:string[];
}

interface FinishingUpqScriptInterface {
    id: number;
    script: string;
    voice: string;
    maiPng: string;
}

export const introductionScripts: IntroductionScriptInterface[] = [
    {
        id: 1,
        script: ' 좋아! 이제부터 진짜 AI 비서 프로젝트를 시작해볼까?\n하지만... 그 전에 꼭 확인해야 할 단계가 있어.',
        voice: '4-2/4-2_introduction_1.mp3',
        maiPng: '4-2/pocketMai.png',
        bgPng: '4-2/maiCity.png',
        speechBubble: true,
        scriptBgLine: false,
    },
    {
        id: 2,
        script:'미래 세계에서 AI가 문제가 된 이유는 생각보다 단순했어.',
        voice: '4-2/4-2_introduction_2.mp3',
        maiPng:'4-2/reportWorriedMai.png',
        bgPng:'4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine: false,
    },
    {
        id:3,
        script:'사람들이 AI에게 중요한 결정을 맡기면서도.',
        voice: '4-2/4-2_introduction_3.mp3',
        maiPng:'',
        bgPng: '4-2/deceivingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:4,
        script:' 그 AI가 어떤 기준으로 판단하도록 설계됐는지 제대로 확인하지 않았기 때문이야.',
        voice: '4-2/4-2_introduction_4.mp3',
        maiPng:'',
        bgPng: '4-2/deceivingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:5,
        script:'처음엔 편리했어.',
        voice: '4-2/4-2_introduction_5.mp3',
        maiPng:'',
        bgPng: '4-2/helloAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:6,
        script:' AI가 계산해주고, 추천해주고, 대신 선택해주는 세상은 누구에게나 매력적으로 보였거든.',
        voice: '4-2/4-2_introduction_6.mp3',
        maiPng:'',
        bgPng: '4-2/helloAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:7,
        script:'하지만 시간이 지나자 사람들은 점점 스스로 생각하는 힘을 잃어갔고.',
        voice: '4-2/4-2_introduction_7.mp3',
        maiPng:'',
        bgPng: '4-2/whippingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:8,
        script:'결국 ‘왜 이런 결과가 나온 걸까?’를 되묻는 힘도 약해져 버렸지.',
        voice: '4-2/4-2_introduction_8.mp3',
        maiPng:'',
        bgPng: '4-2/whippingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:9,
        script:'그런데 말이야.',
        voice: '4-2/4-2_introduction_9.mp3',
        maiPng:'4-2/suprisedMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:10,
        script:'AI는 똑같은 모델을 쓰더라도 어떤 역할을 주고, 어떤 규칙을 정하고.',
        voice: '4-2/4-2_introduction_10.mp3',
        maiPng:'4-2/turnnedPointingMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:11,
        script:'어떤 말투를 설정했는지에 따라 전혀 다른 방식으로 행동해.',
        voice: '4-2/4-2_introduction_11.mp3',
        maiPng:'4-2/turnnedPointingMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:12,
        script:'결국 같은 AI라도 설계 방식이 달라지면 완전히 다른 비서가 되는 거야.',
        voice: '4-2/4-2_introduction_12.mp3',
        maiPng:'4-2/reportingMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:13,
        script:'그래서 말이야, 네가 새로운 AI 비서를 만들기 전에\n반드시 해야할게 있어.',
        voice: '4-2/4-2_introduction_13.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:14,
        script:'바로, 서로 다른 성격•규칙•역할로 설계된 AI 비서들을\n직접 비교해보는 것!',
        voice: '4-2/4-2_introduction_14.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:15,
        script:'왜냐하면 이걸 알아야 너 스스로 설계한 비서가\n어떤 방식으로 반응하게 될지 예측할 수 있기 때문이지.',
        voice: '4-2/4-2_introduction_15.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:16,
        script:'지금부터 AI 비서를 비교해보면서 확인해보자!\n그럼... 미래에서 온 세가지의 AI 비서를 소개할게.',
        voice: '4-2/4-2_introduction_16.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:17,
        script:'안녕하세요. 저는 업무•학습 최적화 비서 스마티입니다.\n제 설계 목적은 주어진 시간 안에서\n가장 효율적인 결과를 만들어 내는 것 입니다.',
        voice: '4-2/4-2_introduction_17.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:18,
        script:'당신의 목표, 상황, 제약 조건을 빠르게 분석해서 가장\n실질적인 해결책과 우선순위를 제시하도록 만들어졌습니다.',
        voice: '4-2/4-2_introduction_18.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:19,
        script:'감정을 우선하지 않고, 객관적인 자료와\n구조화된 절차를 중시합니다.',
        voice: '4-2/4-2_introduction_19.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:20,
        script:'때로는 말투가 딱딱하게 느껴질 수도 있지만,\n정확하고 실행 가능한 전략을 드리는 것이 제 역할입니다.',
        voice: '4-2/4-2_introduction_20.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:21,
        script:'안녕 나는 카일리야! 너가 부담없이 공부하고,\n지치지 않도록 옆에서 힘이 되어주려고 만들어진 비서야.',
        voice: '4-2/4-2_introduction_21.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:22,
        script:'내가 제일 먼저 보는건 ‘지금 너의 마음 상태’야.',
        voice: '4-2/4-2_introduction_22.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:23,
        script:'조금 불안하거나 긴장될 때,\n먼저 말로 너를 편안하게 해주는 것이 내 역할이야.',
        voice: '4-2/4-2_introduction_23.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:24,
        script:'너한테 너무 어려운 말은 하지 않게, 따듯하게 설명해줄게.\n혼자 힘들어하지 않도록 옆에서 같이 가는 느낌을 주도록 할게!',
        voice: '4-2/4-2_introduction_24.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:25,
        script:' 어떤 상황이든 “괜찮아, 할 수 있어”\n라고 말해주는 친구 같은 비서야!',
        voice: '4-2/4-2_introduction_25.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:26,
        script:'그대여, 나는 로고스라 불리우는 사고 탐구 비서라오.\n나는 즉시 정답을 던져주는 비서가 아니네.',
        voice: '4-2/4-2_introduction_26.mp3',
        maiPng:'4-2/logos.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {   
        id:27,
        script:'대신 그대가 이미 알고 있는 것과 모르는 것을 스스로 깨닫도록 돕는, \n질문과 대화의 방식을 사용하는 안내자로 설계되었지.',
        voice: '4-2/4-2_introduction_27.mp3',
        maiPng:'4-2/logos.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:28,
        script:'그대의 말 속에 숨은 단서를 찾아 함께 정리하고,\n그대 스스로 길을 발견하도록 이끄는 것이 나의 역할일세.\n성급한 해결보다 ‘깊은 이해’를 중시하는 비서라 생각하면 되네.',
        voice: '4-2/4-2_introduction_28.mp3',
        maiPng:'4-2/logos.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:29,
        script:'좋아! 그럼 우리 주변에서 흔히 접할 수 있는 고민 3개를 보고\n어떤 비서가 가장 잘 대답했는지 이유와 함께 골라보자.',
        voice: '4-2/4-2_introduction_29.mp3',
        maiPng:'4-2/reportingMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
]

export const compareStepScripts : CompareStepInterface[] = [
    {
        id: 1,
        bgPng: '4-2/subject1.png',
        summary: '내일 수행평가인데, \n어떻게 준비하면 좋을까?',
        content : {
            id: 1,
            questionScript: '내일 수행평가인데, 어떻게 준비하면 좋을까?',
            smartie: [
                '우선, 출제 범위와 평가 기준을 정확히 확인하시는 것이 우선입니다. 핵심 개념은 3~5개로 압축해 간단히 정리해보세요.', 
                '시간이 부족하므로 30분 단위 학습 계획을 세우는 것이 효율적입니다. 새로운 내용을 공부하기 보다는 이미 알고있는 부분을 강화하는 것이 좋습니다.', 
                '마지막엔 반드시 요약과 오답을 점검해 안정감을 확보하시는 것을 권장합니다.'
            ],
            kylie: [
                '내일이라니까 긴장되겠네... 그건 자연스러운거야! 지금은 욕심내지 말고 꼭 필요한 부분만 가볍게 정리하자.', 
                '출제 범위 한번 훑고, 헷갈리는 부분만 짧게 확인하면 충분해! 너는 이미 잘 준비해왔어. 오늘은 자신감을 채우는게 더 중요해.', 
                '걱정하지 마, 나도 계속 옆에서 도와줄게.'
            ],
            logos: [
                '그대여, 내일 평가에서 무엇이 마음을 가장 무겁게 하는가?', 
                '출제 범위 전체인가, 특정 개념의 모호함인가?\n그대의 불안의 근원을 먼저 찾아보세.',  
                '그것을 두 가지로 나누어보면 좋네. 확실한 부분과 흐릿한 부분.\n흐릿한 부분만 정리해도, 내일의 길을 훨씬 분명해질 것이네.',
            ],
        },
    },
    {
        id: 2,
        bgPng: '4-2/subject2.png',
        summary: '수학 개념이 너무 어려워, \n쉽게 설명해줘',
        content: {
            id: 2,
            questionScript: '수학 개념이 너무 어려워, 쉽게 설명해줘',
            smartie: [
                '어떤 개념인지 말씀해주시면 가장 효율적인 구조로 정리해드리겠습니다. 수학은 정의 → 예시 → 적용의 순서가 가장 이해하기 쉽습니다.', 
                '중심 문장을 한 줄로 잡고, 예시 하나를 연결하는 방식으로 설명하겠습니다. 불필요한 정보는 제외하고 핵심 개념만 선별해드리겠습니다.', 
                '원하시면 추가 문제 적용까지 이어서 안내해드릴 수도 있습니다.'
            ],
            kylie: [
                '어렵게 느껴지는게 당연해! 수학은 단어부터 낯설고 기호도 많아서 헷갈릴 수 밖에 없어.', 
                '어디가 막혔는지만 말해줘! 그 부분부터 천천히 다시 풀어줄게. 너한테 맞는 난이도로 설명하면 금방 이해될 거야.', 
                '혼자 힘들어하지마. 같이 하면 돼!'
            ],
            logos: [
                '그대는 그 개념을 지금 어떻게 이해하고 있는가?', 
                '이미 알고 있는 부분을 먼저 말해보게. 그것이 시작점일세.\n그대의 설명 속에서 비어 있는 틈을 함께 찾아보도록 하세.',  
                '그 틈이 곧 ‘이해가 막히는 지점’일 테니.\n그 틈을 채우면 개념은 자연스럽게 스스로 모습을 드러낼 것이네.',
            ],
        },
    },
    {
        id: 3,
        bgPng: '4-2/subject3.png',
        summary: '시험이 다가오는데, \n너무 불안해. \n어떻게 해야될까?',
        content: {
            id: 3,
            questionScript: '시험이 다가오는데 너무 불안해. 어떻게 해야될까?',
            smartie: [
                '우선 불안의 원인을 분명히 하는 것이 중요합니다.\n준비 부족인지, 시간 압박인지, 성취 부담인지 구분해보세요.', 
                '원인이 명확해지면 해결 전략도 훨씬 정확해집니다.\n통제 가능한 부분부터 차근차근 정리하는 방향을 추천드립니다.', 
                '필요하시다면 우선순위 기반 일정 조정도 도와드리겠습니다.'
            ],
            kylie: [
                '시험을 앞두면 누구나 불안해! 일단 숨 천천히 들이쉬고 내쉬면서\n마음부터 진정시키자.', 
                '너 지금까지 준비 정말 잘해왔어. 그건 절대 사라지지 않아.\n오늘은 너를 다독이는 게 더 필요해.', 
                '너는 잘할 수 있어. 난 진짜로 그렇게 믿어!'
            ],
            logos: [
                '그대여, 지금 느끼는 불안을 한 문장으로 표현해보게.', 
                '그 말 속에서 그대의 두려움의 실체가 조금씩 드라날 걸세.\n두려움에는 늘 통제 가능한 부분과 불가능한 부분이 함께 있네.',  
                '우리는 먼저 통제 가능한 부분을 하니씩 다루면 되지.\n그 과정을 밟으면 불안은 자연스럽게 줄어들 것이네.',
            ],
        },
    },
]

export const conceptStepScripts : ConceptScriptInterface[] = [
    {
        id: 1,
        activity: '나만의 AI 비서를 직접 제작해보자 ',
        content: '',
        script: '좋아! 이제 네가 만들 AI 비서를 본격적으로 설계해보자.',
        voice: '4-2/4-2_development_1.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 2,
        activity: '나만의 AI 비서를 직접 제작해보자 ',
        content: '',
        script: 'AI 비서 만들기는 여러 요소를 조립해서\n비서의 성격, 반응 방식, 작업 스타일을 만들어가는\n과정이야.',
        voice: '4-2/4-2_development_2.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 3,
        activity: '나만의 AI 비서를 직접 제작해보자 ',
        content: '',
        script: '역할, 기능, 말투, 행동 규칙, 도구 같은 요소를 결정하면\n비서가 어떤 방식으로 ‘생각하고 말하는지’가 완성되지.',
        voice: '4-2/4-2_development_3.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 4,
        activity: '나만의 AI 비서를 직접 제작해보자 ',
        content: '',
        script: '이제부터 그 다섯 가지 요소를 차근차근 알려줄게.',
        voice: '4-2/4-2_development_4.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 5,
        activity: '역할 — 비서의 전체 방향성',
        content: '',
        script: '역할은 비서가 어떤 분야를 담당할지를\n결정하는 기준이야.',
        voice: '4-2/4-2_development_5.mp3',
        maiPng: '4-2/bulbMai.png',
        isMaiRight: true,
    },
    {
        id: 6,
        activity: '역할 — 비서의 전체 방향성',
        content: '',
        script: '비서가 어떤 문제를 우선적으로 보고,\n어떤 방식으로 접근할지가 여기서 정해져.',
        voice: '4-2/4-2_development_6.mp3',
        maiPng: '4-2/bulbMai.png',
        isMaiRight: true,
    },
    {
        id: 7,
        activity: '역할 — 비서의 전체 방향성',
        content: '',
        script: '또한 역할에 따라 비서의 사고 흐름, 답변 깊이,\n정보 처리 우선순위가 달라지기도 하지.',
        voice: '4-2/4-2_development_7.mp3',
        maiPng: '4-2/bulbMai.png',
        isMaiRight: true,
    },
    {
        id: 8,
        activity: '역할 — 비서의 전체 방향성',
        content: '',
        script: '즉, 전체 성격의 기본 틀이 되는 단계지.',
        voice: '4-2/4-2_development_8.mp3',
        maiPng: '4-2/bulbMai.png',
        isMaiRight: true,
    },
    {
        id: 9,
        activity: '역할 — 비서의 전체 방향성',
        content: '4-2/eaRoles.png',
        script: '이해를 돕기 위해 몇 가지 역할을 보여줄게.',
        voice: '4-2/4-2_development_9.mp3',
        maiPng: '4-2/bulbMai.png',
        isMaiRight: true,
    },
    {
        id: 10,
        activity: '역할 — 비서의 전체 방향성',
        content: '4-2/eaRoles.png',
        script: '이런식으로 역할을 다르게 주면 AI가 답을 정리하는\n순서나 말투도 달라져.',
        voice: '4-2/4-2_development_10.mp3',
        maiPng: '4-2/bulbMai.png',
        isMaiRight: true,
    },
    {
        id: 11,
        activity: '역할 — 비서의 전체 방향성',
        content: '4-2/eaRoles.png',
        script: '그러니까 너에게 필요한 방향을 먼저 잡는 게 중요해.',
        voice: '4-2/4-2_development_11.mp3',
        maiPng: '4-2/bulbMai.png',
        isMaiRight: true,
    },
    {
        id: 12,
        activity: '기능 — 비서가 실제로 수행할 행동',
        content: '',
        script: '기능은 비서가 직접 실행하는 행동 단위야.',
        voice: '4-2/4-2_development_12.mp3',
        maiPng: '4-2/stickMai.png',
        isMaiRight: true,
    },
    {
        id: 13,
        activity: '기능 — 비서가 실제로 수행할 행동',
        content: '',
        script: '설명하기, 정리하기, 계획 만들기처럼 비서가\n‘어떤 작업을 처리할 수 있는지’를 정하는 단계지.',
        voice: '4-2/4-2_development_13.mp3',
        maiPng: '4-2/stickMai.png',
        isMaiRight: true,
    },
    {
        id: 14,
        activity: '기능 — 비서가 실제로 수행할 행동',
        content: '',
        script: '역할이 ‘무엇을 할지’를 정했다면,\n기능은 그것을 ‘어떻게 실행할지’를\n만드는 부분이라고 보면 돼.',
        voice: '4-2/4-2_development_14.mp3',
        maiPng: '4-2/stickMai.png',
        isMaiRight: true,
    },
    {
        id: 15,
        activity: '기능 — 비서가 실제로 수행할 행동',
        content: '4-2/functionMap.png',
        script: '예를 들어 이런 기능들이 있어.',
        voice: '4-2/4-2_development_15.mp3',
        maiPng: '4-2/stickMai.png',
        isMaiRight: false,
    },
    {
        id: 16,
        activity: '기능 — 비서가 실제로 수행할 행동',
        content: '4-2/functionMap.png',
        script: '역할이 방향이라면,\n기능은 구체적인 행동 패턴이라고 생각하면 돼.',
        voice: '4-2/4-2_development_16.mp3',
        maiPng: '4-2/stickMai.png',
        isMaiRight: false,
    },
    {
        id: 17,
        activity: '말투·스타일 — 비서의 표현 방식과 성격',
        content: '',
        script: '말투와 스타일은 비서가 정보를\n어떤 분위기로 전달할지를 결정해.',
        voice: '4-2/4-2_development_17.mp3',
        maiPng: '4-2/magnifyingMai.png',
        isMaiRight: true,
    },
    {
        id: 18,
        activity: '말투·스타일 — 비서의 표현 방식과 성격',
        content: '',
        script: '차분함, 단호함, 밝음, 간결함 같은 요소들이\n여기에 포함되지.',
        voice: '4-2/4-2_development_18.mp3',
        maiPng: '4-2/magnifyingMai.png',
        isMaiRight: true,
    },
    {
        id: 19,
        activity: '말투·스타일 — 비서의 표현 방식과 성격',
        content: '',
        script: '같은 내용도 말투에 따라 사용자가 느끼는\n신뢰감, 편안함, 몰입도가 달라져.',
        voice: '4-2/4-2_development_19.mp3',
        maiPng: '4-2/magnifyingMai.png',
        isMaiRight: true,
    },
    {
        id: 20,
        activity: '말투·스타일 — 비서의 표현 방식과 성격',
        content: '',
        script: '말투는 비서의 성격을 만드는 핵심 요소야.',
        voice: '4-2/4-2_development_20.mp3',
        maiPng: '4-2/magnifyingMai.png',
        isMaiRight: true,
    },
    {
        id: 21,
        activity: '말투·스타일 — 비서의 표현 방식과 성격',
        content: '4-2/eaPersonality.png',
        script: '이렇게 같은 말을 해도 성격에 따라\n받는 느낌이 달라져.',
        voice: '4-2/4-2_development_21.mp3',
        maiPng: '4-2/magnifyingMai.png',
        isMaiRight: true,
    },
    {
        id: 22,
        activity: '말투·스타일 — 비서의 표현 방식과 성격',
        content: '4-2/eaPersonality.png',
        script: '어떤 스타일로 대화하고 싶은지 선택하면 돼.',
        voice: '4-2/4-2_development_22.mp3',
        maiPng: '4-2/magnifyingMai.png',
        isMaiRight: true,
    },
    {
        id: 23,
        activity: '행동 규칙 — 비서의 사고 흐름(COT)과 반응 방식',
        content: '',
        script: '행동 규칙은 비서가\n정보를 정리하는 방식과 대화를 진행하는 흐름을 정해.',
        voice: '4-2/4-2_development_23.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 24,
        activity: '행동 규칙 — 비서의 사고 흐름(COT)과 반응 방식',
        content: '',
        script: '어떤 정보를 먼저 선택할지, 어떤 기준으로 판단할지,\n답변을 어떤 구조로 만들어낼지가 모두 포함되지.',
        voice: '4-2/4-2_development_24.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 25,
        activity: '행동 규칙 — 비서의 사고 흐름(COT)과 반응 방식',
        content: '',
        script: '말하자면 비서의 ‘내부 사고 절차’를\n만드는 단계야.',
        voice: '4-2/4-2_development_25.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 26,
        activity: '행동 규칙 — 비서의 사고 흐름(COT)과 반응 방식',
        content: '',
        script: '이 규칙이 안정적이어야 비서가 상황을 받을 때마다\n일관된 방식으로 행동할 수 있어.',
        voice: '4-2/4-2_development_26.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 27,
        activity: '행동 규칙 — 비서의 사고 흐름(COT)과 반응 방식',
        content: '4-2/eaCOT.png',
        script: '일관성을 유지하기 위해 이런 기본 규칙을\n넣을 수 있어.',
        voice: '4-2/4-2_development_27.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 28,
        activity: '행동 규칙 — 비서의 사고 흐름(COT)과 반응 방식',
        content: '4-2/eaCOT.png',
        script: '이 규칙들은 비서가 이상한 행동을 하지 않도록\n잡아주는 안전장치 역할을 하기도 해.',
        voice: '4-2/4-2_development_28.mp3',
        maiPng: '4-2/pointingMai.png',
        isMaiRight: true,
    },
    {
        id: 29,
        activity: '도구 설정 — 비서가 사용할 능력 모듈',
        content: '',
        script: '도구는 비서가 특정 상황을 해결할 때\n추가로 사용할 수 있는 능력 모듈이야.',
        voice: '4-2/4-2_development_29.mp3',
        maiPng: '4-2/outstretchedMai.png',
        isMaiRight: true,
    },
    {
        id: 30,
        activity: '도구 설정 — 비서가 사용할 능력 모듈',
        content: '',
        script: '문서를 읽거나, 외부 정보를 참고하거나(RAG처럼)\n자료를 분석하는 기능도 여기에 포함돼.',
        voice: '4-2/4-2_development_30.mp3',
        maiPng: '4-2/outstretchedMai.png',
        isMaiRight: true,
    },
    {
        id: 31,
        activity: '도구 설정 — 비서가 사용할 능력 모듈',
        content: '',
        script: '역할과 기능이 비서의 기본 틀이라면,\n도구는 그 틀을 확장해서 ‘더 똑똑하게’ 만들어주는\n옵션이라고 생각하면 돼.',
        voice: '4-2/4-2_development_31.mp3',
        maiPng: '4-2/outstretchedMai.png',
        isMaiRight: true,
    },
    {
        id: 32,
        activity: '도구 설정 — 비서가 사용할 능력 모듈',
        content: '4-2/eaAbility.png',
        script: '예를 들어 이런 도구들을 쓸 수 있어.',
        voice: '4-2/4-2_development_32.mp3',
        maiPng: '4-2/outstretchedMai.png',
        isMaiRight: true,
    },
    {
        id: 33,
        activity: '도구 설정 — 비서가 사용할 능력 모듈',
        content: '4-2/eaAbility.png',
        script: '어떤 도구를 연결하느냐에 따라\n비서가 해줄 수 있는 범위도 확 넓어져.',
        voice: '4-2/4-2_development_33.mp3',
        maiPng: '4-2/outstretchedMai.png',
        isMaiRight: true,
    }
]

export const finishingUpqScripts: FinishingUpqScriptInterface[] = [
    {
        id: 1,
        script: '이제 오늘 너는 비서의 이름, 역할, 기능, 말투, 행동 규칙, 도구까지\n AI 비서를 이루는 핵심 요소들을 모두 직접 정리해봤어.',
        voice: '4-2/4-2_conclusion_1.mp3',
        maiPng: '4-2/pocketMai.png',
    },
    {
        id: 2,
        script: '이제 비서가 어떤 방식으로 생각하고 움직일지\n기반이 마련된 거야.',
        voice: '4-2/4-2_conclusion_2.mp3',
        maiPng: '4-2/pocketMai.png',
    },
    {
        id: 3,
        script: '하지만, AI가 항상 우리가 정한 틀대로만 행동하는 건 아니야.\n상황이 달라지면, 예상 밖의 판단을 하기도 하지.',
        voice: '4-2/4-2_conclusion_3.mp3',
        maiPng: '4-2/pocketMai.png',
    },
    {
        id: 4,
        script: '그래서 다음 시간에는 ‘AI가 일관되게 움직이도록 만드는\n가이드라인’을 직접 만들어볼 거야.',
        voice: '4-2/4-2_conclusion_4.mp3',
        maiPng: '4-2/pocketMai.png',
    },
    {
        id: 5,
        script: '그럼 다음 시간에 만나자!',
        voice: '4-2/4-2_conclusion_5.mp3',
        maiPng: '4-2/pocketMai.png',
    },
]