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

// Custom error class for chat-related errors
export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ChatError";
  }
}

// Validation helpers
const validateChatCreation = (data: CreateChatDto) => {
  if (!data.type) {
    throw new ChatError("Chat type is required", 400, "MISSING_CHAT_TYPE");
  }

  if (data.type === ChatType.GROUP && !data.name?.trim()) {
    throw new ChatError(
      "Group chat name is required",
      400,
      "MISSING_GROUP_NAME"
    );
  }

  if (
    data.type === ChatType.PRIVATE &&
    (!data.participantIds || data.participantIds.length !== 1)
  ) {
    throw new ChatError(
      "Private chat requires exactly one participant",
      400,
      "INVALID_PARTICIPANTS"
    );
  }

  if (data.type === ChatType.PROJECT && !data.projectId) {
    throw new ChatError(
      "Project chat requires a project ID",
      400,
      "MISSING_PROJECT_ID"
    );
  }
};

const validateMessageCreation = (data: CreateChatMessageDto) => {
  if (!data.content?.trim()) {
    throw new ChatError("Message content is required", 400, "MISSING_CONTENT");
  }

  if (data.content.length > 5000) {
    throw new ChatError(
      "Message content is too long (max 5000 characters)",
      400,
      "CONTENT_TOO_LONG"
    );
  }
};

// Error handler
const handleApiError = (error: any, context: string): never => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || `Failed to ${context}`;
    throw new ChatError(message, status, data?.code);
  } else if (error.request) {
    throw new ChatError(
      `Network error: Unable to ${context}`,
      0,
      "NETWORK_ERROR"
    );
  } else {
    throw new ChatError(
      `Unexpected error: ${error.message}`,
      500,
      "UNKNOWN_ERROR"
    );
  }
};

export const chatService = {
  // Chat Management
  createChat: async (data: CreateChatDto): Promise<Chat> => {
    try {
      validateChatCreation(data);

      const response = await apiClient.post("/chat", data);
      return response.data;
    } catch (error) {
      if (error instanceof ChatError) {
        throw error;
      }
      return handleApiError(error, "create chat");
    }
  },

  getUserChats: async (): Promise<ChatsResponse> => {
    try {
      return await apiClient.get("/chat");
    } catch (error) {
      return handleApiError(error, "fetch user chats");
    }
  },

  getChatById: async (chatId: string): Promise<Chat> => {
    if (!chatId?.trim()) {
      throw new ChatError("Chat ID is required", 400, "MISSING_CHAT_ID");
    }

    try {
      return await apiClient.get(`/chat/${chatId}`);
    } catch (error) {
      return handleApiError(error, "fetch chat");
    }
  },

  updateChat: async (chatId: string, data: UpdateChatDto): Promise<Chat> => {
    if (!chatId?.trim()) {
      throw new ChatError("Chat ID is required", 400, "MISSING_CHAT_ID");
    }

    try {
      return await apiClient.put(`/chat/${chatId}`, data);
    } catch (error) {
      return handleApiError(error, "update chat");
    }
  },

  leaveChat: async (chatId: string): Promise<{ success: boolean }> => {
    if (!chatId?.trim()) {
      throw new ChatError("Chat ID is required", 400, "MISSING_CHAT_ID");
    }

    try {
      return await apiClient.post(`/chat/${chatId}/leave`);
    } catch (error) {
      return handleApiError(error, "leave chat");
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
    if (!chatId?.trim()) {
      throw new ChatError("Chat ID is required", 400, "MISSING_CHAT_ID");
    }

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
      return handleApiError(error, "fetch chat messages");
    }
  },

  createMessage: async (
    chatId: string,
    data: CreateChatMessageDto
  ): Promise<ChatMessage> => {
    if (!chatId?.trim()) {
      throw new ChatError("Chat ID is required", 400, "MISSING_CHAT_ID");
    }

    try {
      validateMessageCreation(data);
      return await apiClient.post(`/chat/${chatId}/messages`, data);
    } catch (error) {
      if (error instanceof ChatError) {
        throw error;
      }
      return handleApiError(error, "create chat message");
    }
  },

  updateMessage: async (
    messageId: string,
    content: string
  ): Promise<ChatMessage> => {
    if (!messageId?.trim()) {
      throw new ChatError("Message ID is required", 400, "MISSING_MESSAGE_ID");
    }

    if (!content?.trim()) {
      throw new ChatError(
        "Message content is required",
        400,
        "MISSING_CONTENT"
      );
    }

    try {
      return await apiClient.put(`/chat/messages/${messageId}`, { content });
    } catch (error) {
      return handleApiError(error, "update chat message");
    }
  },

  deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
    if (!messageId?.trim()) {
      throw new ChatError("Message ID is required", 400, "MISSING_MESSAGE_ID");
    }

    try {
      return await apiClient.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      return handleApiError(error, "delete chat message");
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
    if (!projectId?.trim()) {
      throw new ChatError("Project ID is required", 400, "MISSING_PROJECT_ID");
    }

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
      return handleApiError(error, "fetch project chat messages");
    }
  },

  createProjectMessage: async (
    projectId: string,
    data: CreateChatMessageDto
  ): Promise<ChatMessage> => {
    if (!projectId?.trim()) {
      throw new ChatError("Project ID is required", 400, "MISSING_PROJECT_ID");
    }

    try {
      validateMessageCreation(data);
      return await apiClient.post(`/chat/project/${projectId}/messages`, data);
    } catch (error) {
      if (error instanceof ChatError) {
        throw error;
      }
      return handleApiError(error, "create project chat message");
    }
  },

  // Utility methods
  createPrivateChat: async (participantId: string): Promise<Chat> => {
    if (!participantId?.trim()) {
      throw new ChatError(
        "Participant ID is required",
        400,
        "MISSING_PARTICIPANT_ID"
      );
    }

    return chatService.createChat({
      type: ChatType.PRIVATE,
      participantIds: [participantId], // Backend will automatically add current user
    });
  },

  createGroupChat: async (
    name: string,
    participantIds: string[]
  ): Promise<Chat> => {
    if (!name?.trim()) {
      throw new ChatError("Group name is required", 400, "MISSING_GROUP_NAME");
    }

    if (name.length > 100) {
      throw new ChatError(
        "Group name is too long (max 100 characters)",
        400,
        "GROUP_NAME_TOO_LONG"
      );
    }

    return chatService.createChat({
      type: ChatType.GROUP,
      name: name.trim(),
      participantIds: participantIds || [], // Backend will automatically add current user
    });
  },

  createProjectChat: async (projectId: string): Promise<Chat> => {
    if (!projectId?.trim()) {
      throw new ChatError("Project ID is required", 400, "MISSING_PROJECT_ID");
    }

    return chatService.createChat({
      type: ChatType.PROJECT,
      projectId,
      participantIds: [], // Backend will automatically add all project members
    });
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
    if (!attachments || attachments.length === 0) {
      throw new ChatError(
        "Image message requires at least one attachment",
        400,
        "MISSING_ATTACHMENTS"
      );
    }

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
    if (!attachments || attachments.length === 0) {
      throw new ChatError(
        "File message requires at least one attachment",
        400,
        "MISSING_ATTACHMENTS"
      );
    }

    return chatService.createMessage(chatId, {
      content,
      type: MessageType.FILE,
      replyToId,
      attachments,
    });
  },

  // Enhanced utility methods
  searchChats: async (query: string): Promise<ChatsResponse> => {
    if (!query?.trim()) {
      throw new ChatError(
        "Search query is required",
        400,
        "MISSING_SEARCH_QUERY"
      );
    }

    try {
      return await apiClient.get(
        `/chat/search?q=${encodeURIComponent(query.trim())}`
      );
    } catch (error) {
      return handleApiError(error, "search chats");
    }
  },

  markChatAsRead: async (chatId: string): Promise<{ success: boolean }> => {
    if (!chatId?.trim()) {
      throw new ChatError("Chat ID is required", 400, "MISSING_CHAT_ID");
    }

    try {
      return await apiClient.post(`/chat/${chatId}/read`);
    } catch (error) {
      return handleApiError(error, "mark chat as read");
    }
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      return await apiClient.get("/chat/unread-count");
    } catch (error) {
      return handleApiError(error, "fetch unread count");
    }
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

  // Batch operations
  markMultipleChatsAsRead: async (
    chatIds: string[]
  ): Promise<{ success: boolean }> => {
    if (!chatIds || chatIds.length === 0) {
      throw new ChatError(
        "Chat IDs array is required",
        400,
        "MISSING_CHAT_IDS"
      );
    }

    try {
      return await apiClient.post("/chat/mark-read", { chatIds });
    } catch (error) {
      return handleApiError(error, "mark multiple chats as read");
    }
  },

  // Chat analytics
  getChatStats: async (
    chatId: string
  ): Promise<{
    totalMessages: number;
    participantsCount: number;
    lastActivity: string;
    averageResponseTime?: number;
  }> => {
    if (!chatId?.trim()) {
      throw new ChatError("Chat ID is required", 400, "MISSING_CHAT_ID");
    }

    try {
      return await apiClient.get(`/chat/${chatId}/stats`);
    } catch (error) {
      return handleApiError(error, "fetch chat stats");
    }
  },
};
