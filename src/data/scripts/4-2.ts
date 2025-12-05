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
    subject: string;
    content:CompareStepScriptInterface;
}

interface CompareStepScriptInterface {
  id: number;
  summary: string;
  questionScript: string;
  bgPng:string;
  smartie:string[];
  kylie:string[];
  logos:string[];
}

export const introductionScripts: IntroductionScriptInterface[] = [
    {
        id: 1,
        script: ' 좋아! 이제부터 진짜 AI 비서 프로젝트를 시작해볼까?\n하지만... 그 전에 꼭 확인해야 할 단계가 있어.',
        voice: '4-2/4-2_intro_1.mp3',
        maiPng: '4-2/pocketMai.png',
        bgPng: '4-2/maiCity.png',
        speechBubble: true,
        scriptBgLine: false,
    },
    {
        id: 2,
        script:'미래 세계에서 AI가 문제가 된 이유는 생각보다 단순했어.',
        voice: '4-2/4-2_intro_2.mp3',
        maiPng:'4-2/reportWorriedMai.png',
        bgPng:'4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine: false,
    },
    {
        id:3,
        script:'사람들이 AI에게 중요한 결정을 맡기면서도,',
        voice: '4-2/4-2_intro_3.mp3',
        maiPng:'',
        bgPng: '4-2/deceivingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:4,
        script:' 그 AI가 어떤 기준으로 판단하도록 설계됐는지 제대로 확인하지 않았기 때문이야.',
        voice: '4-2/4-2_intro_4.mp3',
        maiPng:'',
        bgPng: '4-2/deceivingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:5,
        script:'처음엔 편리했어.',
        voice: '4-2/4-2_intro_5.mp3',
        maiPng:'',
        bgPng: '4-2/helloAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:6,
        script:' AI가 계산해주고, 추천해주고, 대신 선택해주는 세상은 누구에게나 매력적으로 보였거든.',
        voice: '4-2/4-2_intro_6.mp3',
        maiPng:'',
        bgPng: '4-2/helloAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:7,
        script:'하지만 시간이 지나자 사람들은 점점 스스로 생각하는 힘을 잃어갔고,',
        voice: '4-2/4-2_intro_7.mp3',
        maiPng:'',
        bgPng: '4-2/whippingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:8,
        script:'결국 ‘왜 이런 결과가 나온 걸까?’를 되묻는 힘도 약해져 버렸지.',
        voice: '4-2/4-2_intro_8.mp3',
        maiPng:'',
        bgPng: '4-2/whippingAi.png',
        speechBubble:false,
        scriptBgLine:true,
    },
    {
        id:9,
        script:'그런데 말이야,',
        voice: '4-2/4-2_intro_9.mp3',
        maiPng:'4-2/suprisedMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:10,
        script:'AI는 똑같은 모델을 쓰더라도 어떤 역할을 주고, 어떤 규칙을 정하고, ',
        voice: '4-2/4-2_intro_10.mp3',
        maiPng:'4-2/turnnedPointingMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:11,
        script:'어떤 말투를 설정했는지에 따라 전혀 다른 방식으로 행동해.',
        voice: '4-2/4-2_intro_11.mp3',
        maiPng:'4-2/turnnedPointingMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:12,
        script:'결국 같은 AI라도 설계 방식이 달라지면 완전히 다른 비서가 되는 거야.',
        voice: '4-2/4-2_intro_12.mp3',
        maiPng:'4-2/reportingMai.png',
        bgPng: '4-2/neoCity.png',
        speechBubble:false,
        scriptBgLine:false,
    },
    {
        id:13,
        script:'그래서 말이야, 네가 새로운 AI 비서를 만들기 전에\n반드시 해야할게 있어.',
        voice: '4-2/4-2_intro_13.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:14,
        script:'바로, 서로 다른 성격•규칙•역할로 설계된 AI 비서들을\n직접 비교해보는 것!',
        voice: '4-2/4-2_intro_14.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:15,
        script:'왜냐하면 이걸 알아야 너 스스로 설계한 비서가\n어떤 방식으로 반응하게 될지 예측할 수 있기 때문이지',
        voice: '4-2/4-2_intro_15.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:16,
        script:'지금부터 AI 비서를 비교해보면서 확인해보자!\n그럼... 미래에서 온 세가지의 AI 비서를 소개할게.',
        voice: '4-2/4-2_intro_16.mp3',
        maiPng:'4-2/calmdownMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:17,
        script:'안녕하세요. 저는 업무•학습 최적화 비서 스마티입니다.\n제 설계 목적은 주어진 시간 안에서\n가장 효율적인 결과를 만들어 내는 것 입니다.',
        voice: '4-2/4-2_intro_17.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:18,
        script:'당신의 목표, 상황, 제약 조건을 빠르게 분석해서 가장\n실질적인 해결책과 우선순위를 제시하도록 만들어졌습니다.',
        voice: '4-2/4-2_intro_18.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:19,
        script:'감정을 우선하지 않고, 객관적인 자료와\n구조화된 절차를 중시합니다.',
        voice: '4-2/4-2_intro_19.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:20,
        script:'때로는 말투가 딱딱하게 느껴질 수도 있지만,\n정확하고 실행 가능한 전략을 드리는 것이 제 역할입니다.',
        voice: '4-2/4-2_intro_20.mp3',
        maiPng:'4-2/smartie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:21,
        script:'안녕 나는 카일리야! 너가 부담없이 공부하고,\n지치지 않도록 옆에서 힘이 되어주려고 만들어진 비서야.',
        voice: '4-2/4-2_intro_21.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:22,
        script:'내가 제일 먼저 보는건 ‘지금 너의 마음 상태’야.',
        voice: '4-2/4-2_intro_22.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:23,
        script:'조금 불안하거나 긴장될 때,\n먼저 말로 너를 편안하게 해주는 것이 내 역할이야.',
        voice: '4-2/4-2_intro_23.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:24,
        script:'너한테 너무 어려운 말은 하지 않게, 따듯하게 설명해줄게.\n혼자 힘들어하지 않도록 옆에서 같이 가는 느낌을 주도록 할게!',
        voice: '4-2/4-2_intro_24.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:25,
        script:' 어떤 상황이든 “괜찮아, 할 수 있어”\n라고 말해주는 친구 같은 비서야!',
        voice: '4-2/4-2_intro_25.mp3',
        maiPng:'4-2/kylie.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:26,
        script:'그대여, 나는 로고스라 불리우는 사고 탐구 비서라오.\n나는 즉시 정답을 던져주는 비서가 아니네.',
        voice: '4-2/4-2_intro_26.mp3',
        maiPng:'4-2/logos.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {   
        id:27,
        script:'대신 그대가 이미 알고 있는 것과 모르는 것을 스스로 깨닫도록 돕는, \n질문과 대화의 방식을 사용하는 안내자로 설계되었지',
        voice: '4-2/4-2_intro_27.mp3',
        maiPng:'4-2/logos.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:28,
        script:'그대의 말 속에 숨은 단서를 찾아 함께 정리하고,\n그대 스스로 길을 발견하도록 이끄는 것이 나의 역할일세.\n성급한 해결보다 ‘깊은 이해’를 중시하는 비서라 생각하면 되네.',
        voice: '4-2/4-2_intro_28.mp3',
        maiPng:'4-2/logos.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
    {
        id:29,
        script:'좋아! 그럼 우리 주변에서 흔히 접할 수 있는 고민 3개를 보고\n어떤 비서가 가장 잘 대답했는지 이유와 함께 골라보자.',
        voice: '4-2/4-2_intro_29.mp3',
        maiPng:'4-2/reportingMai.png',
        bgPng: '4-2/purpleSpace.png',
        speechBubble:true,
        scriptBgLine:false,
    },
]

export const compareStepScripts : CompareStepScriptInterface[] = []