import { getS3ImageURL } from '../utils/loading';

export interface WorldDetail {
  id: number;
  name: string;
  worldName: string;
  color: {
    main: string;
    border: string;
  };
  description: string;
  image: string;
}

export const WORLD_DETAILS: WorldDetail[] = [
  {
    id: 1,
    name: 'AI 초급자',
    worldName: '기억의 숲',
    color: {
      main: 'D5F3B0',
      border: '6EA34C',
    },
    description: 'AI의 기본 개념을 익히고,프롬프트의 기초를 배우는 단계',
    image: getS3ImageURL('worldMapLv1.png'),
  },
  {
    id: 2,
    name: 'AI 중급자',
    worldName: '정보의 협곡',
    color: {
      main: 'F0D6A2',
      border: 'C38749',
    },
    description: '정보를 요약·정리하고AI 활용력을 키우는 단계',
    image: getS3ImageURL('worldMapLv2.png'),
  },
  {
    id: 3,
    name: 'AI 상급자',
    worldName: '추론의 산맥',
    color: {
      main: 'C5CFC3',
      border: '7A8A7C',
    },
    description: '고급 추론과 COT·RAG를 배워 정확도를 높이는 단계',
    image: getS3ImageURL('worldMapLv3.png'),
  },
  {
    id: 4,
    name: 'AI 실전',
    worldName: '지성의 탑',
    color: {
      main: 'C4D2E4',
      border: '758AA3',
    },
    description: '나만의 AI 비서를 설계하고 완성하는 실전 단계',
    image: getS3ImageURL('worldMapLv4.png'),
  },
];

