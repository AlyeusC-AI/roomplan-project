export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatMessageDto {
  content: string;
}

export interface ChatResponse {
  data: ChatMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WebSocketChatMessage {
  id: string;
  content: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebSocketUserEvent {
  userId: string;
  timestamp: string;
}

export interface WebSocketTypingEvent {
  userId: string;
  isTyping: boolean;
}
