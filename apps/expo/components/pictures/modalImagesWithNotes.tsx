import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { OptimizedImage } from "@/lib/utils/imageModule";
import { Text } from "@/components/ui/text";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ImageIcon,
  MessageCircle,
  Star,
  Loader,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { Inference } from "../project/ImageGallery";
import {
  Image,
  useAddComment,
  useBulkUpdateImages,
  useCurrentUser,
  useGetComments,
  useGetProjectById,
  useRemoveImage,
  useUpdateProject,
} from "@service-geek/api-client";
import { toast } from "sonner-native";
import { useRouter } from "next/router";
import { useGlobalSearchParams } from "expo-router";
// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageGalleryProps {
  images: Image[];
  urlMap: {
    [imageKey: string]: string;
  };
  onRefresh?: () => Promise<void>;
  roomName?: string;
  onDelete?: (imageKey: string) => Promise<void>;
  onAddNote?: (imageId: number, note: string) => Promise<void>;
  onToggleIncludeInReport?: (
    publicId: string,
    includeInReport: boolean
  ) => Promise<void>;
  setModalVisible: (visible: boolean) => void;
  modalVisible: boolean;
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
}

export default function ModalImagesWithNotes({
  images,

  roomName,

  setModalVisible,
  modalVisible,
  activeImageIndex,
  setActiveImageIndex,
}: ImageGalleryProps) {
  // Refs for scrolling and input
  const modalScrollRef = useRef<FlatList>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);
  const currentNoteText = useRef("");
  const noteInputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const notesSheetAnim = useRef(new Animated.Value(0)).current;

  // Add effect to handle modal visibility changes
  useEffect(() => {
    if (modalVisible) {
      fadeAnim.setValue(0);
      Animated.spring(fadeAnim, {
        toValue: 1,
        damping: 20,
        stiffness: 90,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  // Handle modal close
  const handleCloseModal = () => {
    Animated.spring(fadeAnim, {
      toValue: 0,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  // Navigate to previous image in modal
  const goToPreviousImage = () => {
    if (activeImageIndex > 0) {
      const newIndex = activeImageIndex - 1;
      setActiveImageIndex(newIndex);
      modalScrollRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  // Navigate to next image in modal
  const goToNextImage = () => {
    if (activeImageIndex < images.length - 1) {
      const newIndex = activeImageIndex + 1;
      setActiveImageIndex(newIndex);
      modalScrollRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  // Handle scroll end in modal
  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {roomName || "Image Gallery"}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            <FlatList
              ref={modalScrollRef}
              data={images as any}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={activeImageIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              renderItem={({ item }) => (
                <ModalItem
                  item={item}
                  modalVisible={modalVisible}
                  activeImageIndex={activeImageIndex}
                  handleCloseModal={handleCloseModal}
                  images={images}
                />
              )}
              keyExtractor={(item) => item.id}
              onMomentumScrollEnd={handleScrollEnd}
            />

            <View style={styles.navigationContainer}>
              <TouchableOpacity
                onPress={goToPreviousImage}
                style={[
                  styles.navButton,
                  activeImageIndex === 0 && styles.navButtonDisabled,
                ]}
                disabled={activeImageIndex === 0}
              >
                <ChevronLeft
                  size={30}
                  color={activeImageIndex === 0 ? "#666" : "#fff"}
                />
              </TouchableOpacity>

              <Text style={styles.pageIndicator}>
                {activeImageIndex + 1} / {images.length}
              </Text>

              <TouchableOpacity
                onPress={goToNextImage}
                style={[
                  styles.navButton,
                  activeImageIndex === images.length - 1 &&
                    styles.navButtonDisabled,
                ]}
                disabled={activeImageIndex === images.length - 1}
              >
                <ChevronRight
                  size={30}
                  color={
                    activeImageIndex === images.length - 1 ? "#666" : "#fff"
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Thumbnails */}
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
                {images.map((image, index) => {
                  const imageUrl = image.url;

                  return (
                    <TouchableOpacity
                      key={image.id}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => {
                        const newIndex = index;
                        setActiveImageIndex(newIndex);
                        modalScrollRef.current?.scrollToIndex({
                          index: newIndex,
                          animated: true,
                          viewPosition: 0.5,
                        });
                        thumbnailScrollRef.current?.scrollTo({
                          x: newIndex * 70,
                          animated: true,
                        });
                      }}
                      style={[
                        styles.thumbnail,
                        index === activeImageIndex && styles.activeThumbnail,
                      ]}
                    >
                      <OptimizedImage
                        uri={imageUrl}
                        style={styles.thumbnailImage}
                        size="small"
                        imageKey={image.id}
                        disabled={true}
                        backgroundColor="#000000"
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </View>
  );
}

// Render image in the modal
const ModalItem = ({
  item,

  modalVisible,
  activeImageIndex,
  handleCloseModal,
  images,
}: {
  item: Image;
  images: Image[];

  modalVisible: boolean;
  activeImageIndex: number;
  handleCloseModal: () => void;
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const { mutate: deleteImage } = useRemoveImage();
  const imageUrl = item.url;
  const { data: comments } = useGetComments(item.id);
  const noteCount = comments?.length || 0;
  const currentNoteText = useRef("");
  const noteInputRef = useRef<TextInput>(null);
  const { mutate: removeImage } = useRemoveImage();
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { data: user } = useCurrentUser();
  const { mutate: addComment } = useAddComment();

  const { projectId } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();

  const { data: project } = useGetProjectById(projectId as string);

  // Animation values
  const notesSheetAnim = useRef(new Animated.Value(0)).current;

  // Handle image deletion
  const handleDeleteImage = async (id: string) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setIsDeleting(true);
            await deleteImage(item.id);
            toast.success("Images deleted successfully");

            if (modalVisible && images[activeImageIndex]?.id === item.id) {
              handleCloseModal();
            }
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  // Add function to toggle notes
  const toggleNotes = () => {
    if (showNotes) {
      Animated.spring(notesSheetAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 90,
        useNativeDriver: true,
      }).start(() => setShowNotes(false));
    } else {
      setShowNotes(true);
      Animated.spring(notesSheetAnim, {
        toValue: 1,
        damping: 20,
        stiffness: 90,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleAddNote = async (imageId: string, note: string) => {
    console.log("🚀 ~ handleAddNote ~ imageId:", imageId);
    console.log("🚀 ~ handleAddNote ~ note:", note);
    if (note.trim()) {
      try {
        setIsAddingNote(true);
        const response = await addComment({
          imageId: imageId,
          data: {
            content: note,
            userId: user?.id!,
          },
        });
        console.log("🚀 ~ handleAddNote ~ response:", response);

        toast.success("Note added successfully");
        currentNoteText.current = "";
        noteInputRef.current?.clear();
      } finally {
        setIsAddingNote(false);
      }
    }
  };

  // Add toggleIncludeInReport function
  const handleToggleIncludeInReport = async (image: Image) => {
    try {
      setIsUpdatingReport(true);
      const response = await bulkUpdateImages({
        projectId,
        filters: {
          ids: [image.id],
        },
        updates: {
          showInReport: !image?.showInReport,
        },
      });
      toast.success("Image updated successfully");
    } catch (error) {
      console.error("Error updating image:", error);
      Alert.alert("Error", "Failed to update image");
    } finally {
      setIsUpdatingReport(false);
    }
  };

  // Add this near the top of the file
  const notesSheetStyle = {
    transform: [
      {
        translateY: notesSheetAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.modalImageContainer}>
      <OptimizedImage
        uri={imageUrl}
        style={styles.modalImage}
        resizeMode="contain"
        imageKey={item.id}
        showInfo={true}
        backgroundColor="#000000"
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, isDeleting && styles.disabledButton]}
          onPress={() => handleDeleteImage(item.id)}
          disabled={isDeleting}
        >
          <Trash2 size={24} color="#fff" opacity={isDeleting ? 0.5 : 1} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isUpdatingReport && styles.disabledButton,
          ]}
          onPress={() => handleToggleIncludeInReport(item)}
          disabled={isUpdatingReport}
        >
          {isUpdatingReport ? (
            <Loader size={24} color="#fff" />
          ) : (
            <Star
              size={24}
              color="#fff"
              fill={item.showInReport ? "#FBBF24" : "transparent"}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={toggleNotes}>
          <MessageCircle size={24} color="#fff" />
          {noteCount > 0 && (
            <View style={styles.noteBadge}>
              <Text style={styles.noteBadgeText}>{noteCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Notes Bottom Sheet */}
      {showNotes && (
        <Animated.View style={[styles.notesSheet, notesSheetStyle]}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesHeaderText}>Notes</Text>
            <TouchableOpacity
              onPress={toggleNotes}
              style={styles.closeNotesButton}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.notesList}>
            {comments?.map((note) => (
              <View key={note.id} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteAvatar}>
                    <Text style={styles.noteAvatarText}>
                      {note.user?.firstName?.charAt(0) || "N"} +
                      {note.user?.lastName?.charAt(0) || "N"}
                    </Text>
                  </View>
                  <View style={styles.noteMetadata}>
                    <Text style={styles.noteAuthor}>
                      {note.user?.firstName} {note.user?.lastName}
                    </Text>
                    <Text style={styles.noteDate}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.noteText}>{note.content}</Text>
              </View>
            ))}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 240 : 20}
            style={styles.addNoteContainer}
          >
            <TextInput
              ref={noteInputRef}
              style={styles.noteInput}
              placeholder="Add a note..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              returnKeyType="done"
              blurOnSubmit={true}
              onChangeText={(text) => {
                currentNoteText.current = text;
              }}
              onSubmitEditing={async (e) => {
                if (item.id) {
                  await handleAddNote(item.id, currentNoteText.current);
                }
              }}
            />
            <TouchableOpacity
              style={[
                styles.submitNoteButton,
                isAddingNote && styles.disabledButton,
              ]}
              onPress={async () => {
                if (item.id) {
                  await handleAddNote(item.id, currentNoteText.current);
                }
              }}
              disabled={isAddingNote}
            >
              <Text
                style={[
                  styles.submitNoteButtonText,
                  isAddingNote && styles.disabledButtonText,
                ]}
              >
                {isAddingNote ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  galleryGrid: {
    padding: 8,
  },
  galleryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  galleryItem: {
    width: (SCREEN_WIDTH - 40) / 3,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    marginHorizontal: 2,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
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
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
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
  actionButtons: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  noteBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#1e40af",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  noteBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  notesSheet: {
    position: "absolute",
    bottom: 70, // Position above the controller
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    height: SCREEN_HEIGHT * 0.6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  notesHeaderText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  closeNotesButton: {
    padding: 5,
  },
  notesList: {
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  noteItem: {
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  noteAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  noteAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noteMetadata: {
    flex: 1,
  },
  noteAuthor: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  noteDate: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  noteText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  addNoteContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: Platform.OS === "ios" ? 20 : 0,
  },
  noteInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    maxHeight: 100,
    minHeight: 40,
  },
  submitNoteButton: {
    backgroundColor: "#1e40af",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitNoteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  gestureContainer: {
    width: "100%",
    height: "100%",
  },
});
