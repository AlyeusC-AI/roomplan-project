import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

interface ChatInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  onSendFile?: (file: any) => void;
  onSendImage?: (image: any) => void;
  replyingTo?: any;
  onCancelReply?: () => void;
  connected?: boolean;
  placeholder?: string;
}

export function ChatInput({
  message,
  onMessageChange,
  onSend,
  onSendFile,
  onSendImage,
  replyingTo,
  onCancelReply,
  connected = true,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = () => {
    if (message.trim() && connected) {
      onSend();
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to select images.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
            },
          ]
        );
        return false;
      }
    }
    return true;
  };

  const handleAttachmentPress = () => {
    if (!connected) {
      Alert.alert(
        "Not Connected",
        "Please wait for connection to send attachments."
      );
      return;
    }

    if (isUploading) {
      Alert.alert(
        "Uploading",
        "Please wait for the current upload to complete."
      );
      return;
    }

    Alert.alert("Add Attachment", "Choose what you want to send", [
      { text: "Cancel", style: "cancel" },
      { text: "Photo/Video", onPress: handleImagePicker },
      { text: "Document", onPress: handleDocumentPicker },
    ]);
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
        };

        if (onSendImage) {
          await onSendImage(file);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      setIsUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          type: asset.mimeType || "application/octet-stream",
          name: asset.name,
          size: asset.size || 0,
        };

        if (onSendFile) {
          await onSendFile(file);
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.container}>
        {/* Reply Preview */}
        {replyingTo && (
          <View style={styles.replyPreview}>
            <View style={styles.replyPreviewHeader}>
              <Text style={styles.replyPreviewText}>
                Replying to {replyingTo.user.firstName}{" "}
                {replyingTo.user.lastName}
              </Text>
              <TouchableOpacity
                onPress={onCancelReply}
                style={styles.cancelReplyButton}
              >
                <Text style={styles.cancelIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.replyPreviewContent} numberOfLines={2}>
              {replyingTo.content}
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          {/* Attachment Button */}
          <TouchableOpacity
            style={[
              styles.attachmentButton,
              isUploading && styles.attachmentButtonDisabled,
            ]}
            disabled={!connected || isUploading}
            onPress={handleAttachmentPress}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#64748b" />
            ) : (
              <Text
                style={[
                  styles.attachmentIcon,
                  { color: connected ? "#64748b" : "#cbd5e1" },
                ]}
              >
                📎
              </Text>
            )}
          </TouchableOpacity>

          {/* Text Input */}
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={onMessageChange}
              placeholder={replyingTo ? "Type your reply..." : placeholder}
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={1000}
              editable={connected && !isUploading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || !connected || isUploading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!message.trim() || !connected || isUploading}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyPreview: {
    backgroundColor: "#dcfce7",
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  replyPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  replyPreviewText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "600",
  },
  replyPreviewContent: {
    fontSize: 11,
    color: "#166534",
    lineHeight: 14,
  },
  cancelReplyButton: {
    padding: 2,
  },
  cancelIcon: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  attachmentButton: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  attachmentButtonDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  attachmentIcon: {
    fontSize: 18,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
  },
  inputWrapperFocused: {
    borderColor: "#3b82f6",
    backgroundColor: "#ffffff",
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    color: "#1e293b",
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
});
