import { apiClient } from "./client";
import type {
  ChatMessage,
  CreateChatMessageDto,
  ChatResponse,
} from "../types/chat";

export const chatService = {
  // Get chat messages for a project
  getMessages: async (
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

    return apiClient.get(url);
  },

  // Create a new chat message
  createMessage: async (
    projectId: string,
    data: CreateChatMessageDto
  ): Promise<ChatMessage> => {
    return apiClient.post(`/chat/project/${projectId}/messages`, data);
  },

  // Delete a chat message
  deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/chat/messages/${messageId}`);
  },
};
