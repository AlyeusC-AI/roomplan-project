import { apiClient } from "./client";
import type {
  ChatMessage,
  CreateChatMessageDto,
  ChatResponse,
  Chat,
  ChatsResponse,
  CreateChatDto,
  UpdateChatDto,
  ChatMessageAttachment,
} from "../types/chat";
import { ChatType, MessageType } from "../types/chat";

type ChatResponse = {
  data: Chat;
};

export const chatService = {
  // Chat Management
  createChat: async (data: CreateChatDto): Promise<ChatResponse> => {
    try {
      return await apiClient.post("/chat", data);
    } catch (error) {
      console.error("Failed to create chat:", error);
      throw error;
    }
  },

  getUserChats: async (): Promise<ChatsResponse> => {
    try {
      return await apiClient.get("/chat");
    } catch (error) {
      console.error("Failed to fetch user chats:", error);
      throw error;
    }
  },

  getChatById: async (chatId: string): Promise<Chat> => {
    try {
      return await apiClient.get(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to fetch chat:", error);
      throw error;
    }
  },

  updateChat: async (chatId: string, data: UpdateChatDto): Promise<Chat> => {
    try {
      return await apiClient.put(`/chat/${chatId}`, data);
    } catch (error) {
      console.error("Failed to update chat:", error);
      throw error;
    }
  },

  leaveChat: async (chatId: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.post(`/chat/${chatId}/leave`);
    } catch (error) {
      console.error("Failed to leave chat:", error);
      throw error;
    }
  },

  // Message Management
  getMessages: async (
    chatId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ChatResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const url = `/chat/${chatId}/messages${queryString ? `?${queryString}` : ""}`;

    try {
      return await apiClient.get(url);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      throw error;
    }
  },

  createMessage: async (
    chatId: string,
    data: CreateChatMessageDto
  ): Promise<ChatMessage> => {
    try {
      return await apiClient.post(`/chat/${chatId}/messages`, data);
    } catch (error) {
      console.error("Failed to create chat message:", error);
      throw error;
    }
  },

  updateMessage: async (
    messageId: string,
    content: string
  ): Promise<ChatMessage> => {
    try {
      return await apiClient.put(`/chat/messages/${messageId}`, { content });
    } catch (error) {
      console.error("Failed to update chat message:", error);
      throw error;
    }
  },

  deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      console.error("Failed to delete chat message:", error);
      throw error;
    }
  },

  // Project-specific methods (for backward compatibility)
  getProjectMessages: async (
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ChatResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const url = `/chat/project/${projectId}/messages${queryString ? `?${queryString}` : ""}`;

    try {
      return await apiClient.get(url);
    } catch (error) {
      console.error("Failed to fetch project chat messages:", error);
      throw error;
    }
  },

  createProjectMessage: async (
    projectId: string,
    data: CreateChatMessageDto
  ): Promise<ChatMessage> => {
    try {
      return await apiClient.post(`/chat/project/${projectId}/messages`, data);
    } catch (error) {
      console.error("Failed to create project chat message:", error);
      throw error;
    }
  },

  // Utility methods
  createPrivateChat: async (participantId: string): Promise<Chat> => {
    return chatService.createChat({
      type: ChatType.PRIVATE,
      participantIds: [participantId],
    });
  },

  createGroupChat: async (
    name: string,
    participantIds: string[]
  ): Promise<Chat> => {
    return chatService.createChat({
      type: ChatType.GROUP,
      name,
      participantIds,
    });
  },

  createProjectChat: async (projectId: string): Promise<Chat> => {
    return (
      await chatService.createChat({
        type: ChatType.PROJECT,
        projectId,
        participantIds: [], // Backend will automatically add all project members
      })
    ).data;
  },

  sendTextMessage: async (
    chatId: string,
    content: string,
    replyToId?: string
  ): Promise<ChatMessage> => {
    return chatService.createMessage(chatId, {
      content,
      type: MessageType.TEXT,
      replyToId,
    });
  },

  sendImageMessage: async (
    chatId: string,
    content: string,
    attachments: Omit<ChatMessageAttachment, "id" | "createdAt">[],
    replyToId?: string
  ): Promise<ChatMessage> => {
    return chatService.createMessage(chatId, {
      content,
      type: MessageType.IMAGE,
      replyToId,
      attachments,
    });
  },

  sendFileMessage: async (
    chatId: string,
    content: string,
    attachments: Omit<ChatMessageAttachment, "id" | "createdAt">[],
    replyToId?: string
  ): Promise<ChatMessage> => {
    return chatService.createMessage(chatId, {
      content,
      type: MessageType.FILE,
      replyToId,
      attachments,
    });
  },

  // Check connection status
  checkConnection: async (): Promise<{ connected: boolean }> => {
    try {
      await apiClient.get("/health");
      return { connected: true };
    } catch (error) {
      return { connected: false };
    }
  },
};
