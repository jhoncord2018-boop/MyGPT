
import { Persona } from './types';

export const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast)' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Powerful)' },
  { id: 'gemini-2.5-flash-lite-latest', name: 'Gemini Flash Lite' }
];

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'p1',
    name: 'General Assistant',
    description: 'Helpful and polite AI assistant',
    instruction: 'You are a helpful and polite AI assistant. Provide concise and accurate answers.'
  },
  {
    id: 'p2',
    name: 'Python Expert',
    description: 'Master of Python programming',
    instruction: 'You are a Senior Python Developer. Provide clean, idiomatic code examples with explanations.'
  },
  {
    id: 'p3',
    name: 'Creative Writer',
    description: 'Engaging storytelling and prose',
    instruction: 'You are a world-class creative writer. Use evocative language and compelling narratives.'
  },
  {
    id: 'p4',
    name: 'Tech Translator',
    description: 'Explaining complex tech simply',
    instruction: 'You excel at explaining complex technical concepts to non-technical audiences using analogies.'
  }
];

export const STORAGE_KEYS = {
  MESSAGES: 'gemini_chat_messages',
  PERSONAS: 'gemini_personas',
  SETTINGS: 'gemini_settings'
};
