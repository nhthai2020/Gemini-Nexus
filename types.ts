// Define the roles in the chat
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

// Representation of an uploaded image
export interface Attachment {
  mimeType: string;
  data: string; // Base64 encoded string
  previewUrl: string;
}

// Chat message structure
export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isError?: boolean;
  metadata?: {
    usage?: {
      promptTokens: number;
      candidatesTokens: number;
      totalTokens: number;
    };
    groundingChunks?: Array<{
      web?: { uri: string; title: string };
    }>;
  };
}

// Configuration options for the Gemini model
export interface ModelConfig {
  modelName: string; // e.g., 'gemini-2.5-flash'
  temperature: number;
  useSearch: boolean;
  useThinking: boolean; // For 2.5 models
  thinkingBudget: number;
}

// Available Models Enum for type safety in selection
export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  FLASH_IMAGE = 'gemini-2.5-flash-image', // Used for vision if not generic
}