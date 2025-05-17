import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { format, formatDistance } from "date-fns";
import {
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Platform,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Building,
  Camera,
  Edit2,
  Mic,
  MoreVertical,
  Plus,
  Square,
  Trash,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";
import { toast } from "sonner-native";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ActivityIndicator, ScrollView, Image, Dimensions } from "react-native";
import Empty from "@/components/project/empty";
import { RefreshControl, View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useDebounce } from "@/utils/debounce";
import { v4 } from "react-native-uuid/dist/v4";
import AddRoomButton from "@/components/project/AddRoomButton";
import { useCameraStore } from "@/lib/state/camera";
import { router, useGlobalSearchParams } from "expo-router";
import { uploadImage } from "@/lib/imagekit";
import {
  useUpdateNote,
  useDeleteNote,
  useCreateNote,
  useGetNotes,
  useGetNote,
  useGetRooms,
  useUpdateRoom,
  useDeleteRoom,
  Note,
  Room,
  useAddImage,
  useRemoveImage,
} from "@service-geek/api-client";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  noteCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 12,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  singleImage: {
    width: "100%",
    height: 240,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridImage: {
    borderRadius: 8,
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 8,
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  modalControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalContent: {
    flex: 1,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalImageContainer: {
    width: screenWidth,
    height: screenHeight - 200,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(30, 64, 175, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    color: "#fff",
    fontSize: 16,
  },
  thumbnailContainer: {
    height: 80,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  thumbnailScroll: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 4,
    overflow: "hidden",
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: "#1e40af",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
});

// Helper function to generate image placeholder
export function generatePlaceholderColor(imageKey: string): string {
  // Simple hash function to get a consistent color from the key
  let hash = 0;
  for (let i = 0; i < imageKey.length; i++) {
    hash = imageKey.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a pastel color
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 90%)`;
}

export function OptimizedImage({
  uri,
  style,
  resizeMode = "cover",
  size = "medium",
  backgroundColor,
}: {
  uri: string;
  style: any;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate placeholder color based on the image key
  const placeholderColor = generatePlaceholderColor("");

  // Optimize the URL based on the requested size
  const optimizedUri = uri;

  return (
    <View
      style={[{ backgroundColor: backgroundColor || placeholderColor }, style]}
    >
      <Image
        source={{
          uri: optimizedUri,
          cache: "force-cache",
          headers:
            Platform.OS === "ios"
              ? { "Cache-Control": "max-age=31536000" }
              : undefined,
        }}
        style={style}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      )}
      {error && (
        <View
          style={[
            styles.loadingContainer,
            style,
            { backgroundColor: "rgba(0,0,0,0.05)" },
          ]}
        >
          <ImageIcon size={24} color="#9CA3AF" />
          <Text className="text-gray-400 mt-2">Failed to load image</Text>
        </View>
      )}
    </View>
  );
}

// Add new ImageGalleryModal component
const ImageGalleryModal = ({
  visible,
  onClose,
  images,
  initialIndex,
  onDeleteImage,
}: {
  visible: boolean;
  onClose: () => void;
  images: Image[];
  initialIndex: number;
  onDeleteImage: (imageId: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalScrollRef = useRef<FlatList>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  // Handle modal open
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialIndex]);

  // Handle modal close
  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Handle scroll end
  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  // Render image in the modal
  const renderModalItem = ({ item }: { item: any }) => (
    <View style={styles.modalImageContainer}>
      <OptimizedImage
        uri={item.url}
        style={styles.modalImage}
        resizeMode="contain"
        backgroundColor="#000000"
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            backgroundColor: "rgba(0,0,0,1)",
          },
        ]}
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#fff" />
            </Pressable>
            <Text style={styles.modalTitle}>Image Gallery</Text>
            {images[currentIndex] && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete Image",
                    "Are you sure you want to delete this image?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          onDeleteImage(images[currentIndex].id);
                        },
                      },
                    ]
                  );
                }}
                style={[styles.closeButton, { right: 60 }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            ref={modalScrollRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            renderItem={renderModalItem}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={handleScrollEnd}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={3}
            scrollEventThrottle={16}
            decelerationRate="fast"
          />

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  modalScrollRef.current?.scrollToIndex({
                    index: currentIndex - 1,
                    animated: true,
                  });
                }
              }}
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              disabled={currentIndex === 0}
            >
              <ChevronLeft
                size={30}
                color={currentIndex === 0 ? "#666" : "#fff"}
              />
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              {currentIndex + 1} / {images.length}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (currentIndex < images.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                  modalScrollRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                  });
                }
              }}
              style={[
                styles.navButton,
                currentIndex === images.length - 1 && styles.navButtonDisabled,
              ]}
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight
                size={30}
                color={currentIndex === images.length - 1 ? "#666" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.thumbnailContainer}>
            <ScrollView
              ref={thumbnailScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScroll}
              scrollEventThrottle={16}
              bounces={false}
              decelerationRate="fast"
              snapToInterval={70}
              snapToAlignment="start"
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={image.id}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => {
                    setCurrentIndex(index);
                    modalScrollRef.current?.scrollToIndex({
                      index,
                      animated: true,
                      viewPosition: 0.5,
                    });
                    thumbnailScrollRef.current?.scrollTo({
                      x: index * 70,
                      animated: true,
                    });
                  }}
                  style={[
                    styles.thumbnail,
                    index === currentIndex && styles.activeThumbnail,
                  ]}
                >
                  <OptimizedImage
                    uri={image.url}
                    style={styles.thumbnailImage}
                    size="small"
                    backgroundColor="#000000"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

export default ImageGalleryModal;
