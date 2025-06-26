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

    try {
      return await apiClient.get(url);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      throw error;
    }
  },

  // Create a new chat message
  createMessage: async (
    projectId: string,
    data: CreateChatMessageDto
  ): Promise<ChatMessage> => {
    try {
      return await apiClient.post(`/chat/project/${projectId}/messages`, data);
    } catch (error) {
      console.error("Failed to create chat message:", error);
      throw error;
    }
  },

  // Delete a chat message
  deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      console.error("Failed to delete chat message:", error);
      throw error;
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
};
