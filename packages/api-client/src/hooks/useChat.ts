import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "../services/chat";
import { useAuthStore } from "../services/storage";
import { useCurrentUser } from "./useAuth";
import type {
  ChatMessage,
  CreateChatMessageDto,
  ChatResponse,
  WebSocketChatMessage,
  WebSocketUserEvent,
  WebSocketTypingEvent,
  WebSocketMessageUpdateEvent,
  WebSocketMessageDeleteEvent,
  ChatMessageAttachment,
  Chat,
} from "../types/chat";
import { MessageType } from "../types/chat";
import { baseURL } from "../services/client";

interface UseChatOptions {
  chatId: string;
  autoConnect?: boolean;
  enableNotifications?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (
    content: string,
    type?: MessageType,
    attachments?: Omit<ChatMessageAttachment, "id" | "createdAt">[],
    replyToId?: string
  ) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  connected: boolean;
  typingUsers: string[];
  joinChat: () => void;
  leaveChat: () => void;
  hasMoreMessages: boolean;
}

export const useChat = ({
  chatId,
  autoConnect = true,
  enableNotifications = true,
}: UseChatOptions): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const socketRef = useRef<any>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const token = useAuthStore((state) => state.token);
  const { data: currentUser } = useCurrentUser();

  // Notification function
  const showNotification = useCallback(
    (message: WebSocketChatMessage) => {
      if (
        !enableNotifications ||
        !currentUser ||
        message.user.id === currentUser.id
      ) {
        return; // Don't show notification for own messages
      }

      // Check if browser supports notifications
      if (!("Notification" in window)) {
        return;
      }

      // Request permission if not granted
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(
              `New message from ${message.user.firstName} ${message.user.lastName}`,
              {
                body: message.content,
                icon: "/favicon.ico",
                tag: `chat-${chatId}`,
              }
            );
          }
        });
      } else if (Notification.permission === "granted") {
        new Notification(
          `New message from ${message.user.firstName} ${message.user.lastName}`,
          {
            body: message.content,
            icon: "/favicon.ico",
            tag: `chat-${chatId}`,
          }
        );
      }
    },
    [enableNotifications, currentUser, chatId]
  );

  const connectSocket = useCallback(async () => {
    if (!token || !chatId) return;

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
        setError(null);
        console.log("Connected to chat server");

        // Join the chat room
        socketRef.current?.emit("joinChat", { chatId });
      });

      socketRef.current.on("disconnect", () => {
        setConnected(false);
        console.log("Disconnected from chat server");
      });

      socketRef.current.on("newMessage", (message: WebSocketChatMessage) => {
        // Convert WebSocket message to ChatMessage format
        const chatMessage: ChatMessage = {
          ...message,
          isDeleted: false,
        };
        setMessages((prev) => [...prev, chatMessage]); // Add to end for chronological display
        showNotification(message);
      });

      socketRef.current.on(
        "messageUpdated",
        (message: WebSocketMessageUpdateEvent) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === message.id ? { ...msg, ...message } : msg
            )
          );
        }
      );

      socketRef.current.on(
        "messageDeleted",
        (event: WebSocketMessageDeleteEvent) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === event.messageId
                ? { ...msg, isDeleted: true, content: "[Message deleted]" }
                : msg
            )
          );
        }
      );

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

      socketRef.current.on("reconnect", () => {
        setConnected(true);
        setError(null);
        console.log("Reconnected to chat server");

        // Rejoin the chat room after reconnection
        socketRef.current?.emit("joinChat", { chatId });
      });
    } catch (err) {
      console.error("Failed to initialize WebSocket:", err);
      setError("Failed to initialize chat connection");
    }
  }, [token, chatId]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leaveChat");
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

        const response = await chatService.getMessages(chatId, {
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
          setMessages(chatData.reverse()); // Reverse to show oldest first
        } else {
          setMessages((prev) =>
            [...chatData, ...prev].sort((a, b) => {
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            })
          ); // Add older messages at top
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
    [chatId]
  );

  const sendMessage = useCallback(
    async (
      content: string,
      type: MessageType = MessageType.TEXT,
      attachments?: Omit<ChatMessageAttachment, "id" | "createdAt">[],
      replyToId?: string
    ) => {
      if (!socketRef.current || !connected) {
        // Fallback to HTTP if WebSocket is not connected
        try {
          const newMessage = await chatService.createMessage(chatId, {
            content,
            type,
            attachments,
            replyToId,
          });
          setMessages((prev) => [...prev, newMessage]); // Add to end for chronological display
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to send message"
          );
          throw err;
        }
        return;
      }

      try {
        socketRef.current.emit("sendMessage", {
          chatId,
          content,
          type,
          attachments,
          replyToId,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      }
    },
    [chatId, connected]
  );

  const updateMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!socketRef.current || !connected) {
        // Fallback to HTTP if WebSocket is not connected
        try {
          const updatedMessage = await chatService.updateMessage(
            messageId,
            content
          );
          setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
          );
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to update message"
          );
          throw err;
        }
        return;
      }

      try {
        socketRef.current.emit("updateMessage", { messageId, content });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update message"
        );
        throw err;
      }
    },
    [connected]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!socketRef.current || !connected) {
        // Fallback to HTTP if WebSocket is not connected
        try {
          await chatService.deleteMessage(messageId);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, isDeleted: true, content: "[Message deleted]" }
                : msg
            )
          );
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to delete message"
          );
          throw err;
        }
        return;
      }

      try {
        socketRef.current.emit("deleteMessage", { messageId });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete message"
        );
        throw err;
      }
    },
    [connected]
  );

  const loadMoreMessages = useCallback(async () => {
    if (hasMoreMessages && !loading) {
      await loadMessages(currentPage + 1);
    }
  }, [hasMoreMessages, loading, currentPage, loadMessages]);

  const joinChat = useCallback(() => {
    if (token && chatId) {
      connectSocket();
    }
  }, [token, chatId, connectSocket]);

  const leaveChat = useCallback(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  // Auto-connect when component mounts
  useEffect(() => {
    if (autoConnect && token && chatId) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [autoConnect, token, chatId, connectSocket, disconnectSocket]);

  // Load initial messages
  useEffect(() => {
    if (chatId) {
      loadMessages(1);
    }
  }, [chatId, loadMessages]);

  // Clear error when connection is restored
  const clearErrorOnConnection = useCallback(() => {
    if (connected) {
      setError(null);
    }
  }, [connected]);

  // Periodic connection check
  const startConnectionCheck = useCallback(() => {
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
    }

    connectionCheckRef.current = setInterval(async () => {
      if (!connected && token && chatId) {
        try {
          const { connected: isConnected } =
            await chatService.checkConnection();

          if (isConnected) {
            // Try to reconnect if we detect the server is available
            connectSocket();
          }
        } catch (error) {
          console.log("Connection check failed:", error);
        }
      }
    }, 10000); // Check every 10 seconds
  }, [connected, token, chatId, connectSocket]);

  // Stop connection check
  const stopConnectionCheck = useCallback(() => {
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
      connectionCheckRef.current = null;
    }
  }, []);

  // Clear error when connection is restored
  useEffect(() => {
    clearErrorOnConnection();
  }, [clearErrorOnConnection]);

  // Start/stop connection checking
  useEffect(() => {
    if (!connected) {
      startConnectionCheck();
    } else {
      stopConnectionCheck();
    }

    return () => {
      stopConnectionCheck();
    };
  }, [connected, startConnectionCheck, stopConnectionCheck]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMoreMessages,
    connected,
    typingUsers,
    joinChat,
    leaveChat,
    hasMoreMessages,
  };
};

export const useGetUserChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatService.getUserChats();
      setChats(response.data || []);
    } catch (err) {
      console.error("Error fetching user chats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch chats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    data: { data: chats },
    isLoading: loading,
    error,
    refetch: fetchChats,
  };
};
