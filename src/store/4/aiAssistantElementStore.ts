import { createStore } from 'solid-js/store';
import type { AiAssistantElements } from '../../data/aiAssistantTypes';

const initialState: AiAssistantElements = {
  role: [],
  function: [],
  tone: [],
  rule: [],
  tool: [],
};

export const [aiAssistantElements, setAiAssistantElements] = createStore<AiAssistantElements>(initialState);

// 헬퍼 함수들
export const setRoleFeatures = (features: string[]) => {
  setAiAssistantElements('role', features);
};

export const setFunctionFeatures = (features: string[]) => {
  setAiAssistantElements('function', features);
};

export const setToneFeatures = (features: string[]) => {
  setAiAssistantElements('tone', features);
};

export const setRuleFeatures = (features: string[]) => {
  setAiAssistantElements('rule', features);
};

export const setToolFeatures = (features: string[]) => {
  setAiAssistantElements('tool', features);
};

export const resetAiAssistantElements = () => {
  setAiAssistantElements(initialState);
};
