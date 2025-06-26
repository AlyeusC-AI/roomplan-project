import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image as RNImage,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import { format } from "date-fns";

const { width: screenWidth } = Dimensions.get("window");

interface MessageProps {
  message: any;
  isSent: boolean;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onImagePress: (attachment: any) => void;
  onDownload: (fileUrl: string, fileName: string) => void;
  downloadingFiles?: Set<string>;
}

export function Message({
  message,
  isSent,
  isSelected,
  onLongPress,
  onPress,
  onReply,
  onEdit,
  onDelete,
  onImagePress,
  onDownload,
  downloadingFiles = new Set(),
}: MessageProps) {
  const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    return format(messageDate, "h:mm a");
  };

  const isImage = (attachment: any) => {
    return (
      attachment.mimeType?.startsWith("image/") ||
      attachment.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isDownloading = (fileUrl: string, fileName: string) => {
    return downloadingFiles.has(`${fileUrl}_${fileName}`);
  };

  const hasImageAttachments = message.attachments?.some((attachment: any) =>
    isImage(attachment)
  );
  const hasOnlyImages =
    hasImageAttachments &&
    !message.content?.trim() &&
    message.attachments?.every((attachment: any) => isImage(attachment));
  const hasTextContent = message.content?.trim();

  return (
    <View
      style={[
        styles.messageContainer,
        isSent ? styles.messageContainerSent : styles.messageContainerReceived,
      ]}
    >
      {/* Reply Context - Outside the message bubble */}
      {message.replyTo && (
        <View
          style={[
            styles.replyContext,
            isSent ? styles.replyContextSent : styles.replyContextReceived,
          ]}
        >
          <Text style={styles.replyText}>
            Replying to {message.replyTo.user.firstName}{" "}
            {message.replyTo.user.lastName}
          </Text>
          <Text style={styles.replyContent} numberOfLines={2}>
            {message.replyTo.content}
          </Text>
        </View>
      )}

      {/* Message Bubble */}
      <TouchableOpacity
        onLongPress={onLongPress}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.messageBubble,
            isSent ? styles.messageBubbleSent : styles.messageBubbleReceived,
            hasImageAttachments && styles.messageBubbleWithImages,
            hasOnlyImages && styles.messageBubbleImageOnly,
          ]}
        >
          {/* Message Content */}
          {message.isDeleted ? (
            <Text style={[styles.messageText, styles.deletedMessage]}>
              This message was deleted
            </Text>
          ) : hasTextContent ? (
            <Text
              style={[
                styles.messageText,
                isSent ? styles.messageTextSent : styles.messageTextReceived,
              ]}
            >
              {message.content}
            </Text>
          ) : null}

          {/* Attachments */}
          {message.attachments &&
            message.attachments.length > 0 &&
            !message.isDeleted && (
              <View style={styles.attachmentContainer}>
                {message.attachments.map((attachment: any, index: number) => (
                  <View key={index} style={styles.attachmentItem}>
                    {isImage(attachment) ? (
                      <TouchableOpacity
                        onPress={() => onImagePress(attachment)}
                        style={styles.imageContainer}
                        onLongPress={onLongPress}
                      >
                        <RNImage
                          source={{ uri: attachment.fileUrl }}
                          style={styles.attachmentImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.fileContainer}>
                        <View style={styles.fileIcon}>
                          <Text style={styles.fileIconText}>
                            {attachment.fileName
                              .split(".")
                              .pop()
                              ?.toUpperCase() || "FILE"}
                          </Text>
                        </View>
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {attachment.fileName}
                          </Text>
                          <Text style={styles.fileSize}>
                            {attachment.fileSize
                              ? formatFileSize(attachment.fileSize)
                              : ""}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            onDownload(attachment.fileUrl, attachment.fileName)
                          }
                          style={[
                            styles.downloadButton,
                            isDownloading(
                              attachment.fileUrl,
                              attachment.fileName
                            ) && styles.downloadButtonLoading,
                          ]}
                          disabled={isDownloading(
                            attachment.fileUrl,
                            attachment.fileName
                          )}
                        >
                          {isDownloading(
                            attachment.fileUrl,
                            attachment.fileName
                          ) ? (
                            <ActivityIndicator size="small" color="#1e88e5" />
                          ) : (
                            <Text style={styles.downloadIcon}>↓</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

          {/* Edited indicator */}
          {message.isEdited && !message.isDeleted && (
            <Text style={[styles.messageTime, styles.editedIndicator]}>
              (edited)
            </Text>
          )}

          <Text
            style={[
              styles.messageTime,
              isSent ? styles.messageTimeSent : styles.messageTimeReceived,
            ]}
          >
            {formatMessageTime(new Date(message.createdAt))}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      {isSelected && !message.isDeleted && (
        <View style={[styles.actionButtons, styles.actionButtonsVisible]}>
          <TouchableOpacity style={styles.actionButton} onPress={onReply}>
            <Text style={[styles.actionIcon, { color: "#22c55e" }]}>↩</Text>
          </TouchableOpacity>
          {isSent && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                <Text style={[styles.actionIcon, { color: "#1e88e5" }]}>
                  ✏
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                <Text style={[styles.actionIcon, { color: "#ef4444" }]}>
                  🗑
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 8,
    maxWidth: screenWidth * 0.75,
  },
  messageContainerSent: {
    alignSelf: "flex-end",
  },
  messageContainerReceived: {
    alignSelf: "flex-start",
  },
  replyContext: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  replyContextSent: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.2)",
    alignSelf: "flex-end",
  },
  replyContextReceived: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderColor: "rgba(148, 163, 184, 0.2)",
    alignSelf: "flex-start",
  },
  replyText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 2,
  },
  replyContent: {
    fontSize: 10,
    color: "#64748b",
    lineHeight: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleSent: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 6,
  },
  messageBubbleReceived: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageBubbleWithImages: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  messageBubbleImageOnly: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  messageTextSent: {
    color: "#ffffff",
  },
  messageTextReceived: {
    color: "#1e293b",
  },
  deletedMessage: {
    fontStyle: "italic",
    opacity: 0.6,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  messageTimeSent: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  messageTimeReceived: {
    color: "#94a3b8",
    textAlign: "left",
  },
  editedIndicator: {
    fontSize: 10,
    fontStyle: "italic",
  },
  attachmentContainer: {
    marginTop: 8,
  },
  attachmentItem: {
    marginBottom: 8,
  },
  imageContainer: {
    width: screenWidth * 0.75,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  attachmentImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: 16,
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#1e88e5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileIconText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 11,
    color: "#64748b",
  },
  downloadButton: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButtonLoading: {
    backgroundColor: "#e2e8f0",
  },
  downloadIcon: {
    fontSize: 16,
    color: "#1e88e5",
    fontWeight: "600",
  },
  actionButtons: {
    position: "absolute",
    top: -8,
    right: -8,
    flexDirection: "row",
    gap: 4,
    opacity: 0,
  },
  actionButtonsVisible: {
    opacity: 1,
  },
  actionButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 14,
    fontWeight: "600",
  },
});
