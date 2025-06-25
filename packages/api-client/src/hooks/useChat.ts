import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "../services/chat";
import { useAuthStore } from "../services/storage";
import type {
  ChatMessage,
  CreateChatMessageDto,
  ChatResponse,
  WebSocketChatMessage,
  WebSocketUserEvent,
  WebSocketTypingEvent,
} from "../types/chat";
import { baseURL } from "../services/client";

interface UseChatOptions {
  projectId: string;
  autoConnect?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  connected: boolean;
  typingUsers: string[];
  joinProject: () => void;
  leaveProject: () => void;
  hasMoreMessages: boolean;
}

export const useChat = ({
  projectId,
  autoConnect = true,
}: UseChatOptions): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const socketRef = useRef<any>(null);
  const token = useAuthStore((state) => state.token);

  const connectSocket = useCallback(async () => {
    if (!token || !projectId) return;

    try {
      const { io } = await import("socket.io-client");
      const apiUrl = baseURL;

      socketRef.current = io(`${apiUrl}/chat`, {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        setConnected(true);
        console.log("Connected to chat server");

        // Join the project room
        socketRef.current?.emit("joinProject", { projectId });
      });

      socketRef.current.on("disconnect", () => {
        setConnected(false);
        console.log("Disconnected from chat server");
      });

      socketRef.current.on("newMessage", (message: WebSocketChatMessage) => {
        setMessages((prev) => [message, ...prev]);
      });

      socketRef.current.on("userJoined", (event: WebSocketUserEvent) => {
        console.log("User joined:", event.userId);
      });

      socketRef.current.on("userLeft", (event: WebSocketUserEvent) => {
        console.log("User left:", event.userId);
      });

      socketRef.current.on("userTyping", (event: WebSocketTypingEvent) => {
        setTypingUsers((prev) => {
          if (event.isTyping) {
            return prev.includes(event.userId) ? prev : [...prev, event.userId];
          } else {
            return prev.filter((id) => id !== event.userId);
          }
        });
      });

      socketRef.current.on("error", (error: { message: string }) => {
        setError(error.message);
      });

      socketRef.current.on("connect_error", (error: any) => {
        console.error("WebSocket connection error:", error);
        setError("Failed to connect to chat server");
      });
    } catch (err) {
      console.error("Failed to initialize WebSocket:", err);
      setError("Failed to initialize chat connection");
    }
  }, [token, projectId]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leaveProject");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  const loadMessages = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await chatService.getMessages(projectId, {
          page,
          limit: 50,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        // Handle different response structures
        let chatData: ChatMessage[] = [];
        let meta = { page: 1, totalPages: 1 };

        if (response && typeof response === "object") {
          // If response has a data property (axios response)
          if ("data" in response && response.data) {
            const responseData = response.data as any;
            if (Array.isArray(responseData)) {
              // Direct array of messages
              chatData = responseData;
            } else if (responseData.data && Array.isArray(responseData.data)) {
              // Nested data structure
              chatData = responseData.data;
              meta = responseData.meta || meta;
            }
          } else if (Array.isArray(response)) {
            // Direct array response
            chatData = response;
          } else {
            const responseAny = response as any;
            if (responseAny.data && Array.isArray(responseAny.data)) {
              // Standard API response structure
              chatData = responseAny.data;
              meta = responseAny.meta || meta;
            }
          }
        }

        if (page === 1) {
          setMessages(chatData);
        } else {
          setMessages((prev) => [...prev, ...chatData]);
        }

        setCurrentPage(page);
        setHasMoreMessages(meta.page < meta.totalPages);
      } catch (err) {
        console.error("Error loading messages:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load messages"
        );
        // Set empty array on error to prevent undefined issues
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!socketRef.current || !connected) {
        // Fallback to HTTP if WebSocket is not connected
        try {
          const newMessage = await chatService.createMessage(projectId, {
            content,
          });
          setMessages((prev) => [newMessage, ...prev]);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to send message"
          );
          throw err;
        }
        return;
      }

      try {
        socketRef.current.emit("sendMessage", { projectId, content });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      }
    },
    [projectId, connected]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
      throw err;
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (hasMoreMessages && !loading) {
      await loadMessages(currentPage + 1);
    }
  }, [hasMoreMessages, loading, currentPage, loadMessages]);

  const joinProject = useCallback(() => {
    if (token && projectId) {
      connectSocket();
    }
  }, [token, projectId, connectSocket]);

  const leaveProject = useCallback(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  // Auto-connect when component mounts
  useEffect(() => {
    if (autoConnect && token && projectId) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [autoConnect, token, projectId, connectSocket, disconnectSocket]);

  // Load initial messages
  useEffect(() => {
    if (projectId) {
      loadMessages(1);
    }
  }, [projectId, loadMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    connected,
    typingUsers,
    joinProject,
    leaveProject,
    hasMoreMessages,
  };
};
