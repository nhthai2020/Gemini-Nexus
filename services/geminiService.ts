import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";
import { Message, ModelConfig, Role, Attachment, GeminiModel } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize the client. API_KEY is guaranteed by the environment.
// Using a function to get the client ensures we capture the env var at runtime if needed.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Transforms our internal Message structure into the SDK's Content format.
 */
const mapMessagesToContent = (messages: Message[]): Content[] => {
  return messages
    .filter(m => m.role !== Role.SYSTEM) // System instruction is passed separately in config
    .map(m => {
      const parts: Part[] = [];
      
      // Add attachments if any
      if (m.attachments && m.attachments.length > 0) {
        m.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }

      // Add text
      if (m.text) {
        parts.push({ text: m.text });
      }

      return {
        role: m.role,
        parts: parts
      };
    });
};

/**
 * Main function to send a message to Gemini.
 * It handles both simple text and multimodal requests by constructing the full history manually
 * to ensure consistency, as strict Chat sessions can be tricky with complex tool configurations.
 */
export const sendMessageToGemini = async (
  currentHistory: Message[],
  newMessageText: string,
  attachments: Attachment[],
  config: ModelConfig
): Promise<Message> => {
  const ai = getClient();
  
  // 1. Determine the Model
  // If there are images, we generally prefer a model capable of vision.
  // Gemini 2.5 Flash and 3.0 Pro both support vision.
  // However, we strictly follow the user's selection unless they pick a text-only legacy model (not present here).
  let modelName = config.modelName;

  // 2. Prepare Config
  const generationConfig: any = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: config.temperature,
  };

  // Thinking Config (Gemini 2.5/3.0 feature)
  if (config.useThinking && config.thinkingBudget > 0) {
    generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
    // When using thinking, we should usually relax maxOutputTokens or align it.
    // We'll leave maxOutputTokens undefined to let the model decide, 
    // effectively giving it the remaining context window.
  }

  // Tools (Search)
  if (config.useSearch) {
    generationConfig.tools = [{ googleSearch: {} }];
  }

  // 3. Prepare Contents
  // We reconstruct the full conversation history for the stateless generateContent call.
  // This is often more robust for complex state management in custom UIs than the stateful Chat object.
  const previousContents = mapMessagesToContent(currentHistory);
  
  const currentParts: Part[] = [];
  attachments.forEach(att => {
    currentParts.push({
        inlineData: {
            mimeType: att.mimeType,
            data: att.data
        }
    });
  });
  if (newMessageText) {
      currentParts.push({ text: newMessageText });
  }

  const newContent: Content = {
    role: Role.USER,
    parts: currentParts
  };

  const allContents = [...previousContents, newContent];

  try {
    // 4. API Call
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: allContents,
      config: generationConfig,
    });

    // 5. Extract Response
    const responseText = response.text || "No text response generated.";
    
    // Extract metadata (usage, grounding)
    const usage = response.usageMetadata ? {
      promptTokens: response.usageMetadata.promptTokenCount || 0,
      candidatesTokens: response.usageMetadata.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata.totalTokenCount || 0,
    } : undefined;

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      id: Math.random().toString(36).substring(7),
      role: Role.MODEL,
      text: responseText,
      timestamp: Date.now(),
      metadata: {
        usage,
        groundingChunks: groundingChunks as any, // Type assertion for simplified internal type
      }
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      id: Math.random().toString(36).substring(7),
      role: Role.MODEL,
      text: `Error: ${error.message || "Something went wrong with the request."}`,
      timestamp: Date.now(),
      isError: true,
    };
  }
};
