export enum ChatType {
  PRIVATE = "PRIVATE",
  GROUP = "GROUP",
  PROJECT = "PROJECT",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  AUDIO = "AUDIO",
  SYSTEM = "SYSTEM",
}

export interface ChatParticipant {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

export interface ChatMessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  attachments: ChatMessageAttachment[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  projectId?: string;
  project?: {
    id: string;
    name: string;
    clientName?: string;
  };
  participants: ChatParticipant[];
  lastMessageAt?: string;
  lastMessage?: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface CreateChatMessageDto {
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: Omit<ChatMessageAttachment, "id" | "createdAt">[];
}

export interface CreateChatDto {
  type: ChatType;
  name?: string;
  projectId?: string;
  participantIds: string[];
}

export interface UpdateChatDto {
  name?: string;
  addParticipantIds?: string[];
  removeParticipantIds?: string[];
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

export interface ChatsResponse {
  data: Chat[];
}

export interface WebSocketChatMessage {
  id: string;
  content: string;
  type: MessageType;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  attachments: ChatMessageAttachment[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface WebSocketUserEvent {
  userId: string;
  timestamp: string;
}

export interface WebSocketTypingEvent {
  userId: string;
  isTyping: boolean;
}

export interface WebSocketMessageUpdateEvent {
  id: string;
  content: string;
  type: MessageType;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  attachments: ChatMessageAttachment[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface WebSocketMessageDeleteEvent {
  messageId: string;
  timestamp: string;
}
