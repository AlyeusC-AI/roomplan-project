import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import {
  useChat,
  chatService,
  MessageType,
  useCurrentUser,
  useGetUserChats,
  ChatType,
} from "@service-geek/api-client";
import {
  ChatHeader,
  MessageList,
  MessageListRef,
  ChatInput,
  TypingIndicator,
  ImageViewer,
} from "@/components/project/chat";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { uploadImage } from "@/lib/imagekit";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  errorContent: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  editContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    margin: 16,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#ffffff",
  },
  cancelButtonText: {
    color: "#64748b",
  },
});

export default function ChatDetailScreen() {
  const { chatId } = useGlobalSearchParams<{ chatId: string }>();
  const [message, setMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedMessageImages, setSelectedMessageImages] = useState<any[]>([]);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );
  const [chatInfo, setChatInfo] = useState<any>(null);
  const messageListRef = useRef<MessageListRef>(null);
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { data: chats } = useGetUserChats();

  // Get chat info for header
  useEffect(() => {
    if (chats?.data && chatId) {
      const chat = chats.data.find((c: any) => c.id === chatId);
      setChatInfo(chat);
    }
  }, [chats, chatId]);

  // Extract projectId from chat if it's a project chat
  const getProjectIdFromChat = () => {
    if (chatInfo?.type === ChatType.PROJECT && chatInfo?.projectId) {
      return chatInfo.projectId;
    }
    return undefined;
  };

  const projectId = getProjectIdFromChat();

  const getChatName = (chat: any) => {
    if (!chat) return "Chat";

    if (chat.type === ChatType.PRIVATE) {
      const otherParticipant = chat.participants?.find(
        (p: any) => p.user.id !== currentUser?.id
      );
      return otherParticipant
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : "Private Chat";
    }

    if (chat.type === ChatType.GROUP) {
      return chat.name || "Group Chat";
    }

    return chat.name || "Chat";
  };

  const {
    messages,
    loading: messagesLoading,
    error: chatError,
    sendMessage,
    updateMessage,
    deleteMessage,
    loadMoreMessages,
    connected,
    typingUsers,
    hasMoreMessages,
  } = useChat({
    chatId: chatId || "",
    autoConnect: true,
    enableNotifications: true,
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim(), MessageType.TEXT, [], replyingTo?.id);
      setMessage("");
      setReplyingTo(null);

      // Scroll to bottom after sending message
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const uploadFileToSpace = async (file: any): Promise<any> => {
    try {
      // Upload to space
      const uploadResult = await uploadImage(file, {
        folder: "chat",
        useUniqueFileName: true,
      });
      return {
        fileUrl: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  };

  const handleSendFile = async (file: any) => {
    try {
      toast.loading("Uploading file...");

      // Upload file to space
      const attachment = await uploadFileToSpace(file);

      // Send message with attachment
      await sendMessage("", MessageType.FILE, [attachment], replyingTo?.id);
      setReplyingTo(null);

      toast.dismiss();
      toast.success("File sent successfully");

      // Scroll to bottom after sending file
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
      }, 100);
    } catch (error) {
      console.error("Failed to send file:", error);
      toast.dismiss();
      toast.error("Failed to send file");
    }
  };

  const handleSendImage = async (image: any) => {
    try {
      // Check if this is an array of images (multiple images)
      const isMultipleImages = Array.isArray(image);

      if (isMultipleImages) {
        // Handle multiple images
        toast.loading("Uploading images...");

        const attachments = [];

        for (const img of image) {
          // Check if this is a project image (already has a URL)
          const isProjectImage = img.uri && img.uri.startsWith("http");

          if (isProjectImage) {
            // For project images, use the existing URL directly
            attachments.push({
              fileUrl: img.uri,
              fileName: img.name || "image.jpg",
              fileSize: img.size || 0,
              mimeType: img.type || "image/jpeg",
            });
          } else {
            // For new images, upload to space first
            const attachment = await uploadFileToSpace(img);
            attachments.push(attachment);
          }
        }

        // Send message with all attachments
        await sendMessage("", MessageType.IMAGE, attachments, replyingTo?.id);
        setReplyingTo(null);
        toast.dismiss();
        toast.success(`${attachments.length} images sent successfully`);
      } else {
        // Handle single image (existing logic)
        const isProjectImage = image.uri && image.uri.startsWith("http");

        if (isProjectImage) {
          // For project images, use the existing URL directly
          const attachment = {
            fileUrl: image.uri,
            fileName: image.name || "image.jpg",
            fileSize: image.size || 0,
            mimeType: image.type || "image/jpeg",
          };

          // Send message with attachment
          await sendMessage(
            "",
            MessageType.IMAGE,
            [attachment],
            replyingTo?.id
          );
          setReplyingTo(null);
          toast.success("Project image sent successfully");
        } else {
          // For new images, upload to space first
          toast.loading("Uploading image...");
          const attachment = await uploadFileToSpace(image);

          // Send message with attachment
          await sendMessage(
            "",
            MessageType.IMAGE,
            [attachment],
            replyingTo?.id
          );
          setReplyingTo(null);
          toast.dismiss();
          toast.success("Image sent successfully");
        }
      }

      // Scroll to bottom after sending image(s)
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
      }, 100);
    } catch (error) {
      console.error("Failed to send image:", error);
      toast.dismiss();
      toast.error("Failed to send image");
    }
  };

  const handleSendAudio = async (audio: any) => {
    try {
      toast.loading("Uploading audio...");

      // Upload audio to space
      const attachment = await uploadFileToSpace(audio);

      // Send message with attachment
      await sendMessage("", MessageType.FILE, [attachment], replyingTo?.id);
      setReplyingTo(null);

      toast.dismiss();
      toast.success("Voice message sent successfully");

      // Scroll to bottom after sending audio
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
      }, 100);
    } catch (error) {
      console.error("Failed to send audio:", error);
      toast.dismiss();
      toast.error("Failed to send voice message");
    }
  };

  const handleEditMessage = async () => {
    if (!editContent.trim() || editContent === editMessageId) return;

    try {
      await updateMessage(editMessageId!, editContent.trim());
      setEditMessageId(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to edit message:", error);
      toast.error("Failed to edit message");
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

  const handleReplyClick = (message: any) => {
    setReplyingTo(message);
    setSelectedMessage(null);
  };

  const handleEditClick = (message: any) => {
    setEditMessageId(message.id);
    setEditContent(message.content);
    setSelectedMessage(null);
  };

  const handleImageClick = (attachment: any, message?: any) => {
    if (message && message.attachments) {
      // Find all image attachments in the message
      const imageAttachments = message.attachments.filter(
        (att: any) =>
          att.mimeType?.startsWith("image/") ||
          att.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );

      // Find the index of the clicked image
      const imageIndex = imageAttachments.findIndex(
        (img: any) => img.fileUrl === attachment.fileUrl
      );

      if (imageIndex !== -1 && imageAttachments.length > 1) {
        // Multiple images in the message - set up for swiping
        setSelectedMessageImages(imageAttachments);
        setSelectedImageIndex(imageIndex);
        setSelectedImage(attachment);
      } else {
        // Single image or not found
        setSelectedMessageImages([attachment]);
        setSelectedImageIndex(0);
        setSelectedImage(attachment);
      }
    } else {
      // Single image
      setSelectedMessageImages([attachment]);
      setSelectedImageIndex(0);
      setSelectedImage(attachment);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const fileId = `${fileUrl}_${fileName}`;

    // Prevent multiple downloads of the same file
    if (downloadingFiles.has(fileId)) {
      return;
    }

    try {
      setDownloadingFiles((prev) => new Set(prev).add(fileId));
      toast.loading("Downloading file...");

      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = fileName.split(".").pop() || "";
      const baseName = fileName.replace(`.${fileExtension}`, "");
      const uniqueFileName = `${baseName}_${timestamp}.${fileExtension}`;

      // Download directory
      const downloadDir = `${FileSystem.documentDirectory}downloads/`;

      // Ensure download directory exists
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, {
          intermediates: true,
        });
      }

      const localUri = `${downloadDir}${uniqueFileName}`;

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(fileUrl, localUri);

      if (downloadResult.status === 200) {
        toast.dismiss();

        // Check if sharing is available
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
          // Share the file
          await Sharing.shareAsync(localUri, {
            mimeType: getMimeType(fileName),
            dialogTitle: `Share ${fileName}`,
          });
          toast.success("File ready to share!");
        } else {
          // Fallback: show success message with file location
          toast.success(`File downloaded to: ${localUri}`);
        }
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult.status}`
        );
      }
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.dismiss();
      toast.error("Failed to download file");
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const getMimeType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  };

  const isMessageSender = (messageUserId: string) => {
    return currentUser?.id === messageUserId;
  };

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  if (messagesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  if (chatError) {
    return (
      <View style={styles.errorContainer}>
        <ChatHeader
          title={getChatName(chatInfo)}
          connected={false}
          onBack={() => router.push(`/chats`)}
        />
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>
            {chatError || "Failed to load chat"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ChatHeader
        title={getChatName(chatInfo)}
        subtitle={connected ? "Live" : "Offline"}
        connected={connected}
        onBack={() => router.push(`/chats`)}
      />

      {/* Message List */}
      <MessageList
        ref={messageListRef}
        messages={safeMessages}
        loading={messagesLoading}
        hasMoreMessages={hasMoreMessages}
        selectedMessage={selectedMessage}
        onLoadMore={loadMoreMessages}
        onMessageSelect={setSelectedMessage}
        onMessageReply={handleReplyClick}
        onMessageEdit={handleEditClick}
        onMessageDelete={handleDeleteMessage}
        onImagePress={handleImageClick}
        onDownload={handleDownload}
        isMessageSender={isMessageSender}
        downloadingFiles={downloadingFiles}
      />

      {/* Edit Message Modal */}
      {editMessageId && (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            autoFocus
            placeholder="Edit your message..."
          />
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={handleEditMessage}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={() => {
                setEditMessageId(null);
                setEditContent("");
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Message Input */}
      <ChatInput
        message={message}
        onMessageChange={setMessage}
        onSend={handleSendMessage}
        onSendFile={handleSendFile}
        onSendImage={handleSendImage}
        onSendAudio={handleSendAudio}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        connected={connected}
        projectId={projectId}
      />

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={!!selectedImage}
        image={selectedImage}
        images={selectedMessageImages}
        currentIndex={selectedImageIndex}
        onClose={() => {
          setSelectedImage(null);
          setSelectedMessageImages([]);
          setSelectedImageIndex(0);
        }}
        onDownload={handleDownload}
        downloadingFiles={downloadingFiles}
      />
    </View>
  );
}
