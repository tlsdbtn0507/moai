import { create } from 'zustand';

type SelectedImage = 'mt' | 'sea' | 'city' | null;

type ScriptStep = {
  index: number;
  audioFile: string;
  script: string;
  isCompleted: boolean;
};

interface DescribeImageState {
  // 유저 입력 및 선택 (저장 필요)
  userPrompt: string;
  selectedImage: SelectedImage;
  
  // 스크립트와 음성 순서 (저장 필요)
  scriptSteps: ScriptStep[];
  currentScriptStep: number;
  
  // Actions
  setUserPrompt: (prompt: string) => void;
  setSelectedImage: (image: SelectedImage) => void;
  initializeScriptSteps: (steps: ScriptStep[]) => void;
  setCurrentScriptStep: (step: number) => void;
  completeScriptStep: (index: number) => void;
  reset: () => void;
}

const initialState = {
  userPrompt: '',
  selectedImage: null as SelectedImage,
  scriptSteps: [] as ScriptStep[],
  currentScriptStep: 0,
};

export const useDescribeImageStore = create<DescribeImageState>((set) => ({
  ...initialState,
  
  setUserPrompt: (prompt) => set({ userPrompt: prompt }),
  setSelectedImage: (image) => set({ selectedImage: image }),
  
  initializeScriptSteps: (steps) => set({ scriptSteps: steps, currentScriptStep: 0 }),
  setCurrentScriptStep: (step) => set({ currentScriptStep: step }),
  
  completeScriptStep: (index) =>
    set((state) => ({
      scriptSteps: state.scriptSteps.map((step, i) =>
        i === index ? { ...step, isCompleted: true } : step
      ),
    })),
  
  reset: () => set(initialState),
}));

