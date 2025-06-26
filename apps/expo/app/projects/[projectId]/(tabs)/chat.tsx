import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import { Empty } from "@/components/ui/empty";
import {
  MessageCircle,
  Send,
  Trash2,
  Loader2,
  ChevronLeft,
} from "lucide-react-native";
import {
  useChat,
  useCurrentUser,
  useGetProjectById,
} from "@service-geek/api-client";
import { format, isToday, isYesterday } from "date-fns";

const { width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  navigationHeader: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageGroup: {
    marginBottom: 16,
  },
  messageDate: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    marginVertical: 16,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 4,
  },
  messageBubbleSent: {
    backgroundColor: "#3b82f6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextSent: {
    color: "#ffffff",
  },
  messageTextReceived: {
    color: "#1e293b",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageTimeSent: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  messageTimeReceived: {
    color: "#94a3b8",
    textAlign: "left",
  },
  messageActions: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  messageActionsVisible: {
    opacity: 1,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  typingBubble: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxWidth: screenWidth * 0.6,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94a3b8",
    marginRight: 4,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
  },
  loadMoreButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignSelf: "center",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
});

export default function ChatScreen() {
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const [message, setMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { data: project } = useGetProjectById(projectId);

  const {
    messages,
    loading,
    error,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    connected,
    typingUsers,
    hasMoreMessages,
  } = useChat({ projectId, autoConnect: true, enableNotifications: true });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage(messageId);
              toast.success("Message deleted");
              setSelectedMessage(null);
            } catch (error) {
              console.error("Failed to delete message:", error);
              toast.error("Failed to delete message");
            }
          },
        },
      ]
    );
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    return format(messageDate, "h:mm a");
  };

  const formatMessageDate = (date: Date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return "Today";
    } else if (isYesterday(messageDate)) {
      return "Yesterday";
    } else {
      return format(messageDate, "MMM d, yyyy");
    }
  };

  const isMessageSender = (messageUserId: string) => {
    return currentUser?.id === messageUserId;
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};

    messages.forEach((message) => {
      const date = formatMessageDate(new Date(message.createdAt));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];
  const messageGroups = groupMessagesByDate(safeMessages);

  if (loading && safeMessages.length === 0) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.container}>
        {/* Navigation Header */}
        <View style={styles.navigationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            {/* @ts-ignore - Known issue with Lucide icon types */}
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {project?.data?.clientName || "Project Chat"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {connected ? "Live" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: connected ? "#10b981" : "#ef4444" },
            ]}
          />
          <Text className="text-sm text-muted-foreground">
            {connected ? "Connected" : "Disconnected"}
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
              {!connected && " Trying to reconnect..."}
            </Text>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadMoreMessages}
              colors={["#3b82f6"]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Load More Messages Button */}
          {hasMoreMessages && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreMessages}
              disabled={loading}
            >
              <View className="flex-row items-center justify-center">
                {loading ? (
                  <>
                    {/* @ts-ignore - Known issue with Lucide icon types */}
                    <Loader2 size={14} color="#64748b" />
                    <Text className="text-sm text-muted-foreground ml-2">
                      Loading...
                    </Text>
                  </>
                ) : (
                  <Text className="text-sm text-muted-foreground">
                    Load More Messages
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Message Groups */}
          {safeMessages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-16">
              <Empty
                title="No messages yet"
                description="Start the conversation!"
                icon={MessageCircle}
              />
            </View>
          ) : (
            Object.entries(messageGroups).map(([date, dateMessages]) => (
              <View key={date} style={styles.messageGroup}>
                <Text style={styles.messageDate}>{date}</Text>
                {dateMessages.map((msg) => {
                  const isSent = isMessageSender(msg.user.id);
                  return (
                    <View key={msg.id} style={{ position: "relative" }}>
                      <TouchableOpacity
                        onLongPress={() => isSent && setSelectedMessage(msg.id)}
                        onPress={() => setSelectedMessage(null)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.messageBubble,
                            isSent
                              ? styles.messageBubbleSent
                              : styles.messageBubbleReceived,
                          ]}
                        >
                          <Text
                            style={[
                              styles.messageText,
                              isSent
                                ? styles.messageTextSent
                                : styles.messageTextReceived,
                            ]}
                          >
                            {msg.content}
                          </Text>
                          <Text
                            style={[
                              styles.messageTime,
                              isSent
                                ? styles.messageTimeSent
                                : styles.messageTimeReceived,
                            ]}
                          >
                            {formatMessageTime(new Date(msg.createdAt))}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Delete Button */}
                      {isSent && selectedMessage === msg.id && (
                        <TouchableOpacity
                          style={[
                            styles.messageActions,
                            styles.messageActionsVisible,
                          ]}
                          onPress={() => handleDeleteMessage(msg.id)}
                        >
                          {/* @ts-ignore - Known issue with Lucide icon types */}
                          <Trash2 size={12} color="#ffffff" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, { animationDelay: "0ms" }]} />
                <View style={[styles.typingDot, { animationDelay: "150ms" }]} />
                <View style={[styles.typingDot, { animationDelay: "300ms" }]} />
              </View>
              <Text className="text-xs text-muted-foreground ml-2">
                {typingUsers.length === 1
                  ? "Someone is typing..."
                  : `${typingUsers.length} people are typing...`}
              </Text>
            </View>
          </View>
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            multiline
            maxLength={1000}
            editable={connected}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || !connected) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || !connected}
          >
            {/* @ts-ignore - Known issue with Lucide icon types */}
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
