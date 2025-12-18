
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  instruction: string;
  description: string;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  personaId: string;
  model: string;
  timestamp: number;
}
