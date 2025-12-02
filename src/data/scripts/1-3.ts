export interface ScriptInterface {
  id: number;
  concept: string;
  script: string;
  voice: string;
  title?: string;
  maiPng: string;
}

export interface MakingAvatarsScriptInterface {
  id: number;
  script: string;
  voice: string;
}

export const importanceOfPromptingScripts: ScriptInterface[] = [
  {
    id: 1,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: '이게 바로 프롬프팅이야.',
    voice: '1-3_Development_1.mp3',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 2,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: "AI한테 '그림 그려줘'라고 하는 게 아니라,'내가 본 세상'을 말로 전달하는 과정.",
    voice: '1-3_Development_2.mp3',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 3,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: 'AI에게 내가 원하는 걸 명확하게 전달하는 말 그 차이 하나로 결과가 완전히 달라지지.',
    voice: '1-3_Development_3.mp3',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 4,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: '우리가 사람한테 부탁할때도 그냥 꽃을 그려줘보다는',
    voice: '1-3_Development_4.mp3',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 5,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: '파란 하늘 아래 노란 해바라기가 있는 그림을 그려줘라고 말하면 훨씬 더 잘 알아듣겠지?',
    voice: '1-3_Development_5.mp3',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 6,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: 'AI도 마찬가지야.',
    voice: '1-3_Development_6.mp3',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 7,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: 'AI는 감정이나 상상을 하지 못하니까 우리가 준 문장을 단서로만 이해해.',
    voice: '1-3_Development_7.mp3',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 8,
    concept: 'AI에게 내가 원하는걸 명확하게 전달하는 말',
    script: '그래서 어떤 단어를 넣느냐, 어떤 순서로 말하느냐에 따라서 결과가 완전 달라져.',
    voice: '1-3_Development_8.mp3',
    title: '프롬프팅',
    maiPng: '1-3/pointingMai.png',
  },
  {
    id: 9,
    concept: '',
    script: '그래서 좋은 프롬프팅이란,',
    voice: '1-3_Development_9.mp3',
    title: '좋은 프롬프팅',
    maiPng: '1-3/outstretchedMai.png',
  },
  {
    id: 10,
    concept: 'AI가 혼동하지 않도록 구체적이고 명확하게 말하는 것',
    script: 'AI가 혼동하지 않도록 구체적이고 명확하게 말하는 것이야.',
    voice: '1-3_Development_10.mp3',
    title: '좋은 프롬프팅',
    maiPng: '1-3/outstretchedMai.png',
  },
  {
    id: 11,
    concept: 'AI가 혼동하지 않도록 구체적이고 명확하게 말하는 것',
    script: '프롬프팅을 좋게 하려면 구체성, 명확성, 맥락성이 있어야해.',
    voice: '1-3_Development_11.mp3',
    title: '좋은 프롬프팅',
    maiPng: '1-3/outstretchedMai.png',
  },
  {
    id: 12,
    concept: 'AI가 혼동하지 않도록 구체적이고 명확하게 말하는 것',
    script: '구체적으로 필요한 정보를 포함하고,',
    voice: '1-3_Development_12.mp3',
    title: '좋은 프롬프팅',
    maiPng: '1-3/outstretchedMai.png',
  },
  {
    id: 13,
    concept: 'AI가 혼동하지 않도록 구체적이고 명확하게 말하는 것',
    script: '애매한 단어 대신 정확한 표현을 사용하고,',
    voice: '1-3_Development_13.mp3',
    title: '좋은 프롬프팅',
    maiPng: '1-3/outstretchedMai.png',
  },
  {
    id: 14,
    concept: 'AI가 혼동하지 않도록 구체적이고 명확하게 말하는 것',
    script: '상황, 감정, 배경 같은 추가 정보가 있어야하지',
    voice: '1-3_Development_14.mp3',
    title: '좋은 프롬프팅',
    maiPng: '1-3/outstretchedMai.png',
  },
];

export type SunsetSelection = 'mt' | 'sea' | 'city';

export const compareImgScripts: ScriptInterface[] = [
  {
    id: 1,
    concept: '노을에 대한 첫 인사',
    script: '우와.. 오늘 노을 진짜 이쁘다. 네가 살던 곳의 노을은 어땠어?',
    voice: '1-3_Introduction_1.mp3',
    maiPng: '1-3/sunsetOfMoai.png',
  },
  {
    id: 2,
    concept: '노을 풍경 설명 요청',
    script: '정말 대단해! 한번 보고 싶은걸?\n혹시 나한테 노을의 풍경을 설명해줄 수 있어?\n내가 너의 설명을 듣고 멋진 노을을 그려줄게',
    voice: '1-3_Introduction_2.mp3',
    maiPng: '1-3/sunsetOfMoai.png',
  },
  {
    id: 3,
    concept: '생성된 이미지에 대한 피드백 요청',
    script: '너의 설명을 듣고 이렇게 그려봤어!\n어때? 너가 봤던 장면과 비슷한 거 같아?\n다른 점을 나한테 알려줄래?',
    voice: '1-3_Introduction_3.mp3',
    maiPng: '1-3/sunsetOfMoai.png',
  },
];

export const makingAvatarsScripts: MakingAvatarsScriptInterface[] = [
  {
    id: 1,
    script: '그럼 이번엔 다른 걸 해보자.\n하늘 대신 캐릭터를 만들어보는 거야',
    voice: '1-3_Practice_1.mp3',
  },
  {
    id: 2,
    script: '너라면 어떤 캐릭터를 만들고 싶어?\n오늘 배운 프롬프팅을 통해\n원하는 캐릭터로 만들어봐',
    voice: '1-3_Practice_2.mp3',
  },
  {
    id: 3,
    script: '얼굴, 옷, 장신구 순서대로\n원하는 모습을 입력해 봐!',
    voice: '1-3_Practice_3.mp3',
  },
  {
    id: 4,
    script: '짜잔~ 너만의 캐릭터가 완성됐어\n어때 맘에 들어?',
    voice: '1-3_Practice_4.mp3',
  }
];

