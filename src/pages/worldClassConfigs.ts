export type ClassVariant = 'green' | 'gray';

export type ClassConfig = {
  id: number;
  position: { top: string; left: string };
  guideOverride?: { top?: string; left?: string; transform?: string };
  variant?: ClassVariant;
};

// 월드 1 클래스 설정
export const WORLD_1_CLASS_CONFIGS: ClassConfig[] = [
  {
    id: 1,
    position: { top: '15%', left: '53%' },
    guideOverride: { top: '33%', left: '60%' },
  },
  { id: 2, position: { top: '30%', left: '35%' } },
  {
    id: 3,
    position: { top: '37%', left: '53%' },
    guideOverride: { top: '33%', left: '60%' },
    variant: 'green',
  },
  {
    id: 4,
    position: { top: '55%', left: '54%' },
    guideOverride: { top: '50%', left: '61%' },
    variant: 'gray',
  },
  {
    id: 5,
    position: { top: '60%', left: '38%' },
    guideOverride: {
      top: '57%',
      left: '40%',
    },
    variant: 'gray',
  },
  {
    id: 6,
    position: { top: '56%', left: '18%' },
    guideOverride: { 
      top: '56%', 
      left: '57%', 
      transform: 'translate(calc(-100% - 32px), -20%)',
    },
    variant: 'gray',
  },
  {
    id: 7,
    position: { top: '75%', left: '25%' },
    guideOverride: { 
      top: '56%', 
      left: '64%',
      transform: 'translate(calc(-100% - 32px), -20%)',
    },
    variant: 'gray',
  },
  {
    id: 8,
    position: { top: '83%', left: '46%' },
    guideOverride: {
      top: '50%',
      left: '16%',
      transform: 'translate(16px, -20%)',
    },
    variant: 'gray',
  },
];

// 월드 2 클래스 설정
export const WORLD_2_CLASS_CONFIGS: ClassConfig[] = [
  {
    id: 1,
    position: { top: '21%', left: '53%' },
    guideOverride: { top: '33%', left: '60%' },
  },
  {
    id: 2,
    position: { top: '33%', left: '35%' },
    guideOverride: { top: '33%', left: '60%' },
  },
  {
    id: 3,
    position: { top: '42%', left: '53%' },
    guideOverride: { top: '33%', left: '60%' },
  },
  {
    id: 4,
    position: { top: '55%', left: '54%' },
    guideOverride: { top: '50%', left: '61%' },
  },
  {
    id: 5,
    position: { top: '60%', left: '38%' },
    guideOverride: {
      top: '57%',
      left: '40%',
    },
  },
  {
    id: 6,
    position: { top: '66%', left: '18%' },
    guideOverride: { 
      top: '56%', 
      left: '57%', 
      transform: 'translate(calc(-100% - 32px), -20%)',
    },
  },
  {
    id: 7,
    position: { top: '76%', left: '32%' },
    guideOverride: { 
      top: '56%', 
      left: '72%',
      transform: 'translate(calc(-100% - 32px), -20%)',
    },
    variant: 'green',
  },
  {
    id: 8,
    position: { top: '83%', left: '55%' },
    guideOverride: {
      top: '50%',
      left: '16%',
      transform: 'translate(16px, -20%)',
    },
    variant: 'gray',
  },
];

// 월드 4 클래스 설정
export const WORLD_4_CLASS_CONFIGS: ClassConfig[] = [
  {
    id: 1,
    position: { top: '25%', left: '39%' },
    guideOverride: { top: '18%', left: '40%' },
  },
  {
    id: 2,
    position: { top: '35%', left: '25%' },
    variant: 'green',
    guideOverride: { top: '18%', left: '51%' },
  },
  {
    id: 3,
    position: { top: '43%', left: '40%' },
    guideOverride: { top: '33%', left: '60%' },
    variant: 'gray',
  },
  {
    id: 4,
    position: { top: '55%', left: '54%' },
    guideOverride: { top: '50%', left: '61%' },
    variant: 'gray',
  },
  {
    id: 5,
    position: { top: '60%', left: '38%' },
    guideOverride: {
      top: '57%',
      left: '40%',
    },
    variant: 'gray',
  },
  {
    id: 6,
    position: { top: '68%', left: '18%' },
    guideOverride: { 
      top: '56%', 
      left: '57%', 
      transform: 'translate(calc(-100% - 32px), -20%)',
    },
    variant: 'gray',
  },
  {
    id: 7,
    position: { top: '78%', left: '30%' },
    guideOverride: { 
      top: '56%', 
      left: '70%',
      transform: 'translate(calc(-100% - 32px), -20%)',
    },
    variant: 'gray',
  },
  {
    id: 8,
    position: { top: '83%', left: '46%' },
    guideOverride: {
      top: '50%',
      left: '16%',
      transform: 'translate(16px, -20%)',
    },
    variant: 'gray',
  },
];

