import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image as RNImage,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { format } from "date-fns";
import { AudioPlayer } from "./AudioPlayer";
import { House, PencilIcon, ReplyIcon, Trash2Icon } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

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
  onImagePress: (attachment: any, message?: any) => void;
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
  const [showTime, setShowTime] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const isAudio = (attachment: any) => {
    return (
      attachment.mimeType?.startsWith("audio/") ||
      attachment.fileName.match(/\.(m4a|mp3|wav|aac)$/i)
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
  const hasAudioAttachments = message.attachments?.some((attachment: any) =>
    isAudio(attachment)
  );
  const hasOnlyImages =
    hasImageAttachments &&
    !message.content?.trim() &&
    message.attachments?.every((attachment: any) => isImage(attachment));
  const hasOnlyAudio =
    hasAudioAttachments &&
    !message.content?.trim() &&
    message.attachments?.every((attachment: any) => isAudio(attachment));
  const hasTextContent = message.content?.trim();

  // Get image attachments for grid layout
  const imageAttachments =
    message.attachments?.filter((attachment: any) => isImage(attachment)) || [];

  const renderImageGrid = () => {
    if (imageAttachments.length === 0) return null;

    if (imageAttachments.length === 1) {
      // Single image - full width with card effect
      return (
        <View style={styles.singleImageCard}>
          <TouchableOpacity
            onPress={() => onImagePress(imageAttachments[0], message)}
            style={styles.singleImageContainer}
            onLongPress={onLongPress}
            activeOpacity={0.9}
          >
            <RNImage
              source={{ uri: imageAttachments[0].fileUrl }}
              style={styles.singleImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      );
    }

    if (imageAttachments.length === 2) {
      // Two images - overlapping cards
      return (
        <View style={styles.twoImageStack}>
          {imageAttachments.map((attachment: any, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => onImagePress(attachment, message)}
              style={[
                styles.twoImageCard,
                index === 1 && styles.twoImageCardOverlap,
              ]}
              onLongPress={onLongPress}
              activeOpacity={0.9}
            >
              <RNImage
                source={{ uri: attachment.fileUrl }}
                style={styles.twoImageCardImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (imageAttachments.length === 3) {
      // Three images - stacked cards with different overlaps
      return (
        <View style={styles.threeImageStack}>
          {imageAttachments.map((attachment: any, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => onImagePress(attachment, message)}
              style={[
                styles.threeImageCard,
                index === 1 && styles.threeImageCardOverlap1,
                index === 2 && styles.threeImageCardOverlap2,
              ]}
              onLongPress={onLongPress}
              activeOpacity={0.9}
            >
              <RNImage
                source={{ uri: attachment.fileUrl }}
                style={styles.threeImageCardImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Four or more images - stacked cards with overlay
    return (
      <View style={styles.multipleImageStack}>
        {imageAttachments.slice(0, 4).map((attachment: any, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={() => onImagePress(attachment, message)}
            style={[
              styles.multipleImageCard,
              index === 1 && styles.multipleImageCardOverlap1,
              index === 2 && styles.multipleImageCardOverlap2,
              index === 3 && styles.multipleImageCardOverlap3,
            ]}
            onLongPress={onLongPress}
            activeOpacity={0.9}
          >
            <RNImage
              source={{ uri: attachment.fileUrl }}
              style={styles.multipleImageCardImage}
              resizeMode="cover"
            />
            {index === 3 && imageAttachments.length > 4 && (
              <View style={styles.multipleImageOverlay}>
                <Text style={styles.multipleImageOverlayText}>
                  +{imageAttachments.length - 4}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
        onLongPress={() => {
          onLongPress();
        }}
        onPress={() => {
          if (Platform.OS !== "web") {
            setShowTime(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setShowTime(false);
            }, 1500);
          }

          onPress();
        }}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.messageBubble,
            isSent ? styles.messageBubbleSent : styles.messageBubbleReceived,
            hasImageAttachments && styles.messageBubbleWithImages,
            hasOnlyImages && styles.messageBubbleImageOnly,
            hasOnlyAudio && styles.messageBubbleAudioOnly,
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
                {renderImageGrid()}
                {message.attachments.map((attachment: any, index: number) => (
                  <View key={index} style={styles.attachmentItem}>
                    {isAudio(attachment) ? (
                      <AudioPlayer
                        audioUrl={attachment.fileUrl}
                        fileName={attachment.fileName}
                        duration={attachment.fileSize}
                      />
                    ) : !isImage(attachment) ? (
                      <View style={styles.messengerFileBubble}>
                        <View style={styles.messengerFileIconCircle}>
                          {/* <Text style={styles.messengerFileIcon}>📄</Text> */}
                          {React.createElement(House as any, {
                            size: 20,
                            color: "#fff",
                          })}
                        </View>
                        <View style={styles.messengerFileTextContainer}>
                          <Text
                            style={styles.messengerFileName}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                          >
                            {attachment.fileName}
                          </Text>
                          <Text style={styles.messengerFileSize}>
                            {attachment.fileSize
                              ? formatFileSize(attachment.fileSize)
                              : ""}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            onDownload(attachment.fileUrl, attachment.fileName)
                          }
                          style={styles.messengerFileDownloadButton}
                          disabled={isDownloading(
                            attachment.fileUrl,
                            attachment.fileName
                          )}
                        >
                          {isDownloading(
                            attachment.fileUrl,
                            attachment.fileName
                          ) ? (
                            <ActivityIndicator
                              size="small"
                              color={Colors.light.primary}
                            />
                          ) : (
                            <Text style={styles.downloadIcon}>↓</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : null}
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
        </View>
      </TouchableOpacity>

      {/* Show time on long press (mobile only) */}
      {showTime && Platform.OS !== "web" && (
        <Text
          style={[
            styles.messageTime,
            isSent ? styles.messageTimeSent : styles.messageTimeReceived,
          ]}
        >
          {formatMessageTime(new Date(message.createdAt))}
        </Text>
      )}

      {/* Action Buttons */}
      {isSelected && !message.isDeleted && (
        <View style={[styles.actionButtons, styles.actionButtonsVisible]}>
          <TouchableOpacity style={styles.actionButton} onPress={onReply}>
            <Text style={[styles.actionIcon, { color: "#22c55e" }]}>
              <ReplyIcon size={16} />
            </Text>
          </TouchableOpacity>
          {isSent && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                <Text
                  style={[styles.actionIcon, { color: Colors.light.primary }]}
                >
                  <PencilIcon size={16} />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                <Text style={[styles.actionIcon, { color: "#ef4444" }]}>
                  <Trash2Icon size={16} />
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
    paddingHorizontal: 8,
    paddingVertical: 8,
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
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  messageBubbleImageOnly: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  messageBubbleAudioOnly: {
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
    paddingHorizontal: 8,
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
    fontSize: 12,
    // marginTop: 4,
    // paddingHorizontal: 16,
  },
  messageTimeSent: {
    // color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
    alignItems: "flex-end",
  },
  messageTimeReceived: {
    // color: "#94a3b8",
    textAlign: "left",
    alignItems: "flex-start",
  },
  editedIndicator: {
    fontSize: 10,
    fontStyle: "italic",
  },
  attachmentContainer: {
    marginTop: 8,
  },
  attachmentItem: {
    marginBottom: 4,
  },
  // Single image card
  singleImageCard: {
    width: screenWidth * 0.75,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "#ffffff",
  },
  singleImageContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  singleImage: {
    width: "100%",
    height: 250,
  },
  messengerFileBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 0,
    marginBottom: 2,
    minWidth: 160,
    maxWidth: screenWidth * 0.7,
  },
  messengerFileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  messengerFileIcon: {
    fontSize: 20,
  },
  messengerFileTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  messengerFileName: {
    fontWeight: "600",
    fontSize: 15,
    color: "#1e293b",
  },
  messengerFileSize: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 1,
  },
  messengerFileDownloadButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 12,
    backgroundColor: "transparent",
    minWidth: 28,
    minHeight: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    position: "absolute",
    top: -30,
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
  // Two image stack
  twoImageStack: {
    width: screenWidth * 0.75,
    height: 200,
    position: "relative",
  },
  twoImageCard: {
    position: "absolute",
    width: screenWidth * 0.75 - 20,
    height: 200,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  twoImageCardOverlap: {
    right: 0,
    top: 10,
    zIndex: 2,
  },
  twoImageCardImage: {
    width: "100%",
    height: "100%",
  },
  // Three image stack
  threeImageStack: {
    width: screenWidth * 0.75,
    height: 200,
    position: "relative",
  },
  threeImageCard: {
    position: "absolute",
    width: screenWidth * 0.75 - 30,
    height: 200,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  threeImageCardOverlap1: {
    right: 10,
    top: 5,
    zIndex: 2,
  },
  threeImageCardOverlap2: {
    right: 20,
    top: 10,
    zIndex: 3,
  },
  threeImageCardImage: {
    width: "100%",
    height: "100%",
  },
  // Multiple image stack (4+ images)
  multipleImageStack: {
    width: screenWidth * 0.75,
    height: 200,
    position: "relative",
  },
  multipleImageCard: {
    position: "absolute",
    width: screenWidth * 0.75 - 40,
    height: 200,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  multipleImageCardOverlap1: {
    right: 10,
    top: 5,
    zIndex: 2,
  },
  multipleImageCardOverlap2: {
    right: 20,
    top: 10,
    zIndex: 3,
  },
  multipleImageCardOverlap3: {
    right: 30,
    top: 15,
    zIndex: 4,
  },
  multipleImageCardImage: {
    width: "100%",
    height: "100%",
  },
  multipleImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  multipleImageOverlayText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
