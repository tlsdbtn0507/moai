import { create } from 'zustand';

interface CharacterImageState {
  generatedImageUrl: string | null;
  prompt: string | null;
  setGeneratedImageUrl: (url: string) => void;
  setPrompt: (prompt: string) => void;
  clearGeneratedImageUrl: () => void;
  reset: () => void;
}

const initialState = {
  generatedImageUrl: null as string | null,
  prompt: null as string | null,
};

export const useCharacterImageStore = create<CharacterImageState>((set) => ({
  ...initialState,
  
  setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
  
  setPrompt: (prompt) => set({ prompt }),
  
  clearGeneratedImageUrl: () => set({ generatedImageUrl: null }),
  
  reset: () => set(initialState),
}));

