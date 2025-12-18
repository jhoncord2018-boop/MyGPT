
import { GoogleGenAI } from "@google/genai";
import { Message, Role } from "../types";

export const callGemini = async (
  modelName: string,
  messages: Message[],
  systemInstruction?: string,
  isContinue: boolean = false
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Format history for the API
  // Filter out system messages if any, though we use them in config
  const history = messages
    .filter(m => m.role !== Role.SYSTEM)
    .map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

  const lastUserMessage = isContinue 
    ? "Continue from where you left off" 
    : history.pop()?.parts[0].text || "";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      ...history,
      { role: Role.USER, parts: [{ text: lastUserMessage }] }
    ],
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    }
  });

  return response.text;
};
