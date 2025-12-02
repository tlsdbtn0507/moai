import { create } from 'zustand';

interface CharacterImageState {
  generatedImageUrl: string | null;
  setGeneratedImageUrl: (url: string) => void;
  clearGeneratedImageUrl: () => void;
  reset: () => void;
}

const initialState = {
  generatedImageUrl: null as string | null,
};

export const useCharacterImageStore = create<CharacterImageState>((set) => ({
  ...initialState,
  
  setGeneratedImageUrl: (url) => set({ generatedImageUrl: url }),
  
  clearGeneratedImageUrl: () => set({ generatedImageUrl: null }),
  
  reset: () => set(initialState),
}));

