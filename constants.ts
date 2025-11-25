import { GeminiModel, ModelConfig } from './types';

export const DEFAULT_CONFIG: ModelConfig = {
  modelName: GeminiModel.FLASH,
  temperature: 0.7,
  useSearch: false,
  useThinking: false,
  thinkingBudget: 1024,
};

export const MODEL_OPTIONS = [
  { value: GeminiModel.FLASH, label: 'Gemini 2.5 Flash (Fast & Efficient)' },
  { value: GeminiModel.PRO, label: 'Gemini 3.0 Pro (Reasoning & Complex)' },
];

export const SYSTEM_INSTRUCTION = `You are Gemini Nexus, an advanced AI assistant. 
Your goal is to provide precise, technically accurate, and visually structured responses. 
When explaining code, use markdown code blocks. 
When analyzing images, be descriptive and focus on details. 
If the user asks about current events and search is enabled, synthesize the information clearly.`;
