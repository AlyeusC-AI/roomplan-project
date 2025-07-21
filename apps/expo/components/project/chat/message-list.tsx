import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Empty } from "@/components/ui/empty";
import { Message } from "./message";
import { format, isToday, isYesterday } from "date-fns";
import { Colors } from "@/constants/Colors";

interface MessageListProps {
  messages: any[];
  loading: boolean;
  hasMoreMessages: boolean;
  selectedMessage: string | null;
  onLoadMore: () => void;
  onMessageSelect: (messageId: string | null) => void;
  onMessageReply: (message: any) => void;
  onMessageEdit: (message: any) => void;
  onMessageDelete: (messageId: string) => void;
  onImagePress: (attachment: any, message?: any) => void;
  onDownload: (fileUrl: string, fileName: string) => void;
  isMessageSender: (messageUserId: string) => boolean;
  downloadingFiles?: Set<string>;
}

export interface MessageListRef {
  scrollToBottom: (animated?: boolean) => void;
}

export const MessageList = forwardRef<MessageListRef, MessageListProps>(
  (
    {
      messages,
      loading,
      hasMoreMessages,
      selectedMessage,
      onLoadMore,
      onMessageSelect,
      onMessageReply,
      onMessageEdit,
      onMessageDelete,
      onImagePress,
      onDownload,
      isMessageSender,
      downloadingFiles = new Set(),
    },
    ref
  ) => {
    const scrollViewRef = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      scrollToBottom: (animated = true) => {
        if (scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated });
          }, 100);
        }
      },
    }));

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

    const groupMessagesByDate = (messages: any[]) => {
      console.log("🚀 ~ groupMessagesByDate ~ messages:", messages);
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

    // Auto-scroll to bottom when messages change
    useEffect(() => {
      if (messages.length > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, [messages.length]);

    // Auto-scroll to bottom when component mounts
    useEffect(() => {
      if (messages.length > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 200);
      }
    }, []);

    const messageGroups = groupMessagesByDate(messages);

    if (messages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDescription}>Start the conversation!</Text>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onLoadMore}
            colors={[Colors.light.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Load More Messages Button */}
        {hasMoreMessages && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={onLoadMore}
            disabled={loading}
          >
            <View style={styles.loadMoreContent}>
              {loading ? (
                <>
                  <Text style={styles.loadingIcon}>⏳</Text>
                  <Text style={styles.loadMoreText}>Loading...</Text>
                </>
              ) : (
                <Text style={styles.loadMoreText}>Load More Messages</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Message Groups */}
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <View key={date} style={styles.messageGroup}>
            <Text style={styles.messageDate}>{date}</Text>
            {dateMessages.map((msg) => {
              const isSent = isMessageSender(msg.user.id);
              const isSelected = selectedMessage === msg.id;

              return (
                <Message
                  key={msg.id}
                  message={msg}
                  isSent={isSent}
                  isSelected={isSelected}
                  onLongPress={() => onMessageSelect(msg.id)}
                  onPress={() => onMessageSelect(null)}
                  onReply={() => onMessageReply(msg)}
                  onEdit={() => onMessageEdit(msg)}
                  onDelete={() => onMessageDelete(msg.id)}
                  onImagePress={(attachment) => onImagePress(attachment, msg)}
                  onDownload={onDownload}
                  downloadingFiles={downloadingFiles}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
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
    fontWeight: "500",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadMoreContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
});
