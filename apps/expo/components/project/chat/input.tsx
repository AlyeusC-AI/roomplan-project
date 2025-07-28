import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
} from "react-native";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { toast } from "sonner-native";
import ProjectImageSelector from "./ProjectImageSelector";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import {
  ArrowUp,
  Camera,
  CameraIcon,
  HomeIcon,
  Image as ImageIcon,
  Images,
  Mic,
  Paperclip,
  Send,
  SendHorizontal,
  Trash2,
} from "lucide-react-native";
import RoomIcon from "@/assets/roomIcon.png";
import { Colors } from "@/constants/Colors";

const SendHorizontalIcon = SendHorizontal as any;
const MicIcon = Mic as any;
// const ImageIcon = ImageIcon as any;
const PaperclipIcon = Paperclip as any;
const ImagesIcon = Images as any;
const Trash2Icon = Trash2 as any;

interface ChatInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  onSendFile?: (file: any) => void;
  onSendImage?: (image: any) => void;
  onSendAudio?: (audio: any) => void;
  replyingTo?: any;
  onCancelReply?: () => void;
  connected?: boolean;
  placeholder?: string;
  projectId?: string;
}

const VoiceNoteBars = ({ duration }: { duration: string }) => {
  const barAnims = Array.from(
    { length: 25 },
    () => useRef(new Animated.Value(1)).current
  );

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 1.5 + 0.5,
            duration: 300 + i * 50,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300 + i * 50,
            useNativeDriver: false,
          }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => {
      animations.forEach((a) => a.stop());
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e0e7ef",
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        // marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        minWidth: 140,
        flex: 1,
      }}
    >
      {/* Optional: Add a mic icon for context */}
      {/* <MicIcon size={22} color={Colors.light.primary} style={{ marginRight: 10 }} /> */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginRight: 14,
          minWidth: 60,
          height: 32,
          flex: 1,
        }}
      >
        {barAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={{
              width: 3,
              marginHorizontal: 3,
              backgroundColor: Colors.light.primary,
              borderRadius: 3,
              height: anim.interpolate({
                inputRange: [0.5, 2],
                outputRange: [12, 32],
              }),
              opacity: 0.85,
            }}
          />
        ))}
      </View>
      <Text
        style={{
          fontWeight: "bold",
          color: Colors.light.primary,
          textAlign: "center",
          minWidth: 40,
        }}
      >
        {duration}
      </Text>
    </View>
  );
};

export function ChatInput({
  message,
  onMessageChange,
  onSend,
  onSendFile,
  onSendImage,
  onSendAudio,
  replyingTo,
  onCancelReply,
  connected = true,
  placeholder = "Type a message...",
  projectId,
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showProjectImageSelector, setShowProjectImageSelector] =
    useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timeInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone permissions to record voice messages.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => Audio.requestPermissionsAsync(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    if (!connected) {
      Alert.alert(
        "Not Connected",
        "Please wait for connection to record voice messages."
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

    try {
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start timer
      timeInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Haptic feedback
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Stop recording
      await recording.stopAndUnloadAsync();

      // Clear timer and animation
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
        timeInterval.current = null;
      }
      pulseAnim.stopAnimation();

      setIsRecording(false);

      // Haptic feedback
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Check if recording is long enough (at least 1 second)
      if (recordingTime >= 1) {
        await handleVoiceRecordingComplete(recording);
      } else {
        Alert.alert(
          "Recording Too Short",
          "Please record for at least 1 second."
        );
        setRecording(null);
        setRecordingTime(0);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
    }

    if (timeInterval.current) {
      clearInterval(timeInterval.current);
      timeInterval.current = null;
    }
    pulseAnim.stopAnimation();

    setIsRecording(false);
    setRecording(null);
    setRecordingTime(0);
  };

  const handleVoiceRecordingComplete = async (recording: Audio.Recording) => {
    try {
      setIsUploading(true);
      toast.loading("Processing audio...");

      // Get the recording URI
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("Failed to get recording URI");
      }

      // Get recording status to get duration
      const status = await recording.getStatusAsync();
      const duration = status.durationMillis || 0;

      // Create file object for the audio
      const audioFile = {
        uri,
        type: "audio/m4a",
        name: `voice_message_${Date.now()}.m4a`,
        size: 0, // We'll get this from the file system if needed
        duration,
      };

      if (onSendAudio) {
        await onSendAudio(audioFile);
      }

      toast.dismiss();
      toast.success("Voice message sent successfully");
      setRecording(null);
      setRecordingTime(0);
    } catch (error) {
      console.error("Failed to send voice message:", error);
      toast.dismiss();
      toast.error("Failed to send voice message");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (message.trim() && connected) {
      onSend();
    }
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera permissions to take photos.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Settings",
              onPress: () => ImagePicker.requestCameraPermissionsAsync(),
            },
          ]
        );
        return false;
      }
    }
    return true;
  };

  const requestMediaLibraryPermissions = async () => {
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

  const handleProjectImageSelect = async (images: any[]) => {
    if (onSendImage) {
      // Send all images as a group if multiple, or single image if only one
      if (images.length === 1) {
        await onSendImage(images[0]);
      } else {
        await onSendImage(images);
      }
    }
  };

  const handleCamera = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      setIsUploading(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
        };

        if (onSendImage) {
          await onSendImage(file);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    try {
      setIsUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets.map((asset, index) => ({
          uri: asset.uri,
          type: asset.type || "image/jpeg",
          name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          size: asset.fileSize || 0,
        }));

        if (onSendImage) {
          // Send all images as a group if multiple, or single image if only one
          if (files.length === 1) {
            await onSendImage(files[0]);
          } else {
            await onSendImage(files);
          }
        }

        if (files.length > 1) {
          toast.success(`${files.length} images selected`);
        }
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to select images. Please try again.");
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
    <>
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
            {/* Recording Indicator */}
            {isRecording ? (
              <View style={[styles.recordingIndicator]}>
                <TouchableOpacity
                  style={styles.cancelRecordingButton}
                  onPress={cancelRecording}
                >
                  <Text style={styles.cancelRecordingText}>
                    <Trash2Icon />
                  </Text>
                </TouchableOpacity>
                {/* Animated bars in a box with duration below */}
                <VoiceNoteBars duration={formatTime(recordingTime)} />
              </View>
            ) : (
              <>
                {/* Attachment Buttons - Hidden when input is focused */}
                {!isFocused && (
                  <View style={styles.attachmentButtons}>
                    {/* Camera Button */}
                    <TouchableOpacity
                      style={[
                        styles.attachmentButton,
                        isUploading && styles.attachmentButtonDisabled,
                      ]}
                      disabled={!connected || isUploading || isRecording}
                      onPress={handleCamera}
                    >
                      <Text style={styles.attachmentIcon}>
                        <CameraIcon color={Colors.light.primary} />
                      </Text>
                    </TouchableOpacity>

                    {/* Gallery Button */}
                    <TouchableOpacity
                      style={[
                        styles.attachmentButton,
                        isUploading && styles.attachmentButtonDisabled,
                      ]}
                      disabled={!connected || isUploading || isRecording}
                      onPress={handleImagePicker}
                    >
                      <Text style={styles.attachmentIcon}>
                        <ImageIcon color={Colors.light.primary} />
                      </Text>
                    </TouchableOpacity>

                    {/* Document Button */}
                    <TouchableOpacity
                      style={[
                        styles.attachmentButton,
                        isUploading && styles.attachmentButtonDisabled,
                      ]}
                      disabled={!connected || isUploading || isRecording}
                      onPress={handleDocumentPicker}
                    >
                      <Text style={styles.attachmentIcon}>
                        <PaperclipIcon color={Colors.light.primary} />
                      </Text>
                    </TouchableOpacity>

                    {/* Project Images Button (only if projectId exists) */}
                    {projectId && (
                      <TouchableOpacity
                        style={[
                          styles.attachmentButton,
                          isUploading && styles.attachmentButtonDisabled,
                        ]}
                        disabled={!connected || isUploading || isRecording}
                        onPress={() => setShowProjectImageSelector(true)}
                      >
                        {/* <Text style={styles.attachmentIcon}><ImagesIcon /></Text> */}
                        {/* <Image
                          source={RoomIcon}
                          style={{
                            width: 25,
                            height: 25,
                            resizeMode: "contain",
                            tintColor: Colors.light.primary,
                            marginBottom: 4,
                          }}
                        /> */}
                        <Text style={styles.attachmentIcon}>
                          <HomeIcon
                            width={25}
                            height={25}
                            color={Colors.light.primary}
                          />
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Back Button - Only shown when input is focused */}
                {isFocused && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setIsFocused(false)}
                  >
                    <Text style={styles.backIcon}>←</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            {/* Text Input */}
            {isRecording ? null : (
              <View
                style={[
                  styles.inputWrapper,
                  isFocused && styles.inputWrapperFocused,
                  isRecording && styles.inputWrapperRecording,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  value={message}
                  onChangeText={onMessageChange}
                  placeholder={
                    isRecording
                      ? "Release to send voice message"
                      : replyingTo
                        ? "Type your reply..."
                        : placeholder
                  }
                  placeholderTextColor="#94a3b8"
                  multiline
                  maxLength={1000}
                  editable={connected && !isUploading && !isRecording}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            )}

            {/* Microphone/Send Button */}
            {isRecording ? (
              <TouchableOpacity
                style={[styles.sendButton, styles.recordingButton]}
                onPress={stopRecording}
              >
                <Text style={styles.sendIcon}>
                  <SendHorizontalIcon color={Colors.light.primary} />
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!message.trim() || !connected || isUploading) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={message.trim() ? handleSend : startRecording}
                disabled={!connected || isUploading}
              >
                <Text style={styles.sendIcon}>
                  {message.trim() ? (
                    <SendHorizontalIcon color={Colors.light.primary} />
                  ) : (
                    <MicIcon color={Colors.light.primary} />
                  )}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Project Image Selector Modal */}
      {projectId && (
        <ProjectImageSelector
          visible={showProjectImageSelector}
          onClose={() => setShowProjectImageSelector(false)}
          onSelectImage={handleProjectImageSelect}
          projectId={projectId}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    gap: 6,
  },
  attachmentButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attachmentButton: {
    // backgroundColor: "#f8fafc",
    // borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#e2e8f0",
  },
  attachmentButtonDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  attachmentIcon: {
    fontSize: 16,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 36,
    maxHeight: 100,
  },
  inputWrapperFocused: {
    borderColor: Colors.light.primary,
    backgroundColor: "#ffffff",
  },
  inputWrapperRecording: {
    borderColor: Colors.light.primary,
    backgroundColor: "#ffffff",
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    color: "#1e293b",
    paddingVertical: 4,
  },
  sendButton: {
    // backgroundColor: Colors.light.primary,
    // borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: Colors.light.primary,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    // backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
    elevation: 0,
  },
  recordingButton: {
    // backgroundColor: "#dc2626",
  },
  sendIcon: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  recordingPulse: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    marginRight: 8,
  },
  recordingIcon: {
    fontSize: 18,
    color: "#ffffff",
  },
  recordingText: {
    fontSize: 12,
    color: "#1e293b",
  },
  cancelRecordingButton: {
    padding: 2,
  },
  cancelRecordingText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  backIcon: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "600",
  },
});
