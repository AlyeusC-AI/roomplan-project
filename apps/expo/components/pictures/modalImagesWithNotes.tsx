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
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import { OptimizedImage } from "@/lib/utils/imageModule";
import { Text } from "@/components/ui/text";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  ImageIcon,
  MessageCircle,
  Star,
  Loader,
  Tag,
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
  useUpdateImage,
  uploadFile,
} from "@service-geek/api-client";
import { toast } from "sonner-native";
import { useRouter } from "next/router";
import { useGlobalSearchParams } from "expo-router";
import { Pencil } from "@/lib/icons/ImageEditorIcons";
import dayjs from "dayjs";
import ImageEditorModal from "../project/ImageEditorModal";
import ImageTagsModal from "./ImageTagsModal";
import { uploadAsync } from "expo-file-system";
import * as FileSystem from "expo-file-system";
import { Colors } from "@/constants/Colors";

// Type assertion to fix ReactNode compatibility
const ChevronLeftIcon = ChevronLeft as any;
const ChevronRightIcon = ChevronRight as any;
const Trash2Icon = Trash2 as any;
const ImageIconComponent = ImageIcon as any;
const MessageCircleIcon = MessageCircle as any;
const StarIcon = Star as any;
const LoaderIcon = Loader as any;
const TagIcon = Tag as any;

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Add base64 to file conversion function
const base64ToFile = async (base64: string): Promise<string> => {
  // Remove the data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

  // Create a temporary file path
  const fileUri = FileSystem.documentDirectory + "temp_image.png";

  // Write the base64 data to the file
  await FileSystem.writeAsStringAsync(fileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};

interface ImageGalleryProps {
  images: Image[];

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
  refetch: () => void;
}

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
    borderColor: Colors.light.primary,
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
    backgroundColor: Colors.light.primary,
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
  tagBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tagBadgeText: {
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
    // maxHeight: SCREEN_HEIGHT * 0.4,
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
    backgroundColor: Colors.light.primary,
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
    // marginBottom: Platform.OS === "ios" ? 20 : 0,
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
    backgroundColor: Colors.light.primary,
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
  imageMetadata: {
    backgroundColor: "rgba(0, 0, 0, 1)",
    padding: 16,
    // paddingBottom: 250,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderColor: Colors.light.primary,
  },
  descriptionContainer: {
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
  },
  descriptionText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  addDescriptionText: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
  },
  descriptionEditContainer: {
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 8,
    color: "#fff",
    fontSize: 14,
    minHeight: 40,
    marginBottom: 8,
  },
  descriptionEditActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  descriptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
  },
  descriptionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  uploaderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  uploaderName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  uploadDate: {
    color: "#999",
    fontSize: 12,
  },
  descriptionModalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  descriptionModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  descriptionModalCloseButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  descriptionModalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  descriptionModalSaveButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  descriptionModalSaveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  descriptionModalInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    padding: 16,
    textAlignVertical: "top",
  },
  readMoreButton: {
    marginTop: 4,
  },
  readMoreText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});

// Custom Close Icon Component
const CloseIcon = ({ size = 24, color = "#fff" }) => (
  <View style={{ width: size, height: size }}>
    <View
      style={{
        position: "absolute",
        width: size,
        height: 2,
        backgroundColor: color,
        transform: [{ rotate: "45deg" }],
        top: size / 2 - 1,
      }}
    />
    <View
      style={{
        position: "absolute",
        width: size,
        height: 2,
        backgroundColor: color,
        transform: [{ rotate: "-45deg" }],
        top: size / 2 - 1,
      }}
    />
  </View>
);

// Add DescriptionEditModal component after styles
const DescriptionEditModal = ({
  isVisible,
  onClose,
  initialDescription,
  onSave,
}: {
  isVisible: boolean;
  onClose: () => void;
  initialDescription: string;
  onSave: (description: string) => void;
}) => {
  const [description, setDescription] = useState(initialDescription);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isVisible) {
      // Focus input when modal becomes visible
      setDescription(initialDescription);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.descriptionModalContainer}>
        <View style={styles.descriptionModalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.descriptionModalCloseButton}
          >
            <CloseIcon size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.descriptionModalTitle}>Edit Description</Text>
          <TouchableOpacity
            onPress={() => onSave(description)}
            style={styles.descriptionModalSaveButton}
          >
            <Text style={styles.descriptionModalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          ref={inputRef}
          style={styles.descriptionModalInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#999"
          multiline
          autoFocus
        />
      </SafeAreaView>
    </Modal>
  );
};

// Add NotesModal component after DescriptionEditModal
const NotesModal = ({
  isVisible,
  onClose,
  imageId,
  // comments,
}: {
  isVisible: boolean;
  onClose: () => void;
  imageId: string;
  // comments: any[];
}) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const noteInputRef = useRef<TextInput>(null);
  const { mutate: addComment } = useAddComment();
  const { data: user } = useCurrentUser();
  const { data: comments } = useGetComments(imageId);

  const handleAddNote = async () => {
    if (noteText.trim() && !isAddingNote) {
      try {
        setIsAddingNote(true);
        await addComment({
          imageId: imageId,
          data: {
            content: noteText.trim(),
            userId: user?.id!,
          },
        });
        toast.success("Note added successfully");
        setNoteText("");
        noteInputRef.current?.clear();
        noteInputRef.current?.blur();
      } finally {
        setIsAddingNote(false);
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 20}
      > */}
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <SafeAreaView
        style={[styles.descriptionModalContainer, { backgroundColor: "#000" }]}
      >
        <View style={styles.descriptionModalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.descriptionModalCloseButton}
          >
            <CloseIcon size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.descriptionModalTitle}>Notes</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.notesList}>
          {comments?.map((note) => (
            <View key={note.id} style={styles.noteItem}>
              <View style={styles.noteHeader}>
                <View style={styles.noteAvatar}>
                  <Text style={styles.noteAvatarText}>
                    {note.user?.firstName?.charAt(0) || "N"}
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 20}
          style={styles.addNoteContainer}
        >
          {/* <View style={styles.addNoteContainer}> */}
          <TextInput
            ref={noteInputRef}
            style={styles.noteInput}
            placeholder="Add a note..."
            placeholderTextColor="#999"
            // multiline
            // numberOfLines={3}
            returnKeyType="send"
            value={noteText}
            onChangeText={setNoteText}
            onSubmitEditing={handleAddNote}
            blurOnSubmit={true}
          />
          <TouchableOpacity
            style={[
              styles.submitNoteButton,
              isAddingNote && styles.disabledButton,
            ]}
            onPress={() => {
              handleAddNote();
              // Keyboard.dismiss();
            }}
            disabled={isAddingNote || !noteText.trim()}
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
          {/* </View> */}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {/* </TouchableWithoutFeedback> */}
      {/* </KeyboardAvoidingView> */}
    </Modal>
  );
};

// Add CollapsibleDescription component
const CollapsibleDescription = ({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100; // Maximum characters to show when collapsed

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldShowReadMore = text.length > maxLength;

  return (
    <TouchableOpacity
      style={styles.descriptionContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={styles.descriptionText}
        numberOfLines={isExpanded ? undefined : 2}
      >
        {text}
      </Text>
      {shouldShowReadMore && (
        <TouchableOpacity onPress={toggleExpand} style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>
            {isExpanded ? "Show less" : "Read more"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function ModalImagesWithNotes({
  images,
  roomName,
  setModalVisible,
  modalVisible,
  activeImageIndex,
  setActiveImageIndex,
  refetch,
}: ImageGalleryProps) {
  // Refs for scrolling and input
  const modalScrollRef = useRef<FlatList>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);
  const currentNoteText = useRef("");
  const noteInputRef = useRef<TextInput>(null);
  const [showNotes, setShowNotes] = useState(false);

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

  // Handle scroll end in modal
  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };
  const activeImage = images[activeImageIndex];

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
                <CloseIcon size={24} color="#fff" />
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
                  refetch={refetch}
                  showNotes={showNotes}
                  setShowNotes={setShowNotes}
                />
              )}
              keyExtractor={(item) => item.id}
              onMomentumScrollEnd={handleScrollEnd}
            />

            <ModalItemMetadata
              item={activeImage}
              activeImageIndex={activeImageIndex}
              setActiveImageIndex={setActiveImageIndex}
              modalScrollRef={modalScrollRef}
              images={images}
              showNotes={showNotes}
              setShowNotes={setShowNotes}
            />

            {/* Thumbnails */}
            {/* <View style={styles.thumbnailContainer}>
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
            </View> */}
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
  refetch,
  showNotes,
  setShowNotes,
}: {
  item: Image;
  images: Image[];
  modalVisible: boolean;
  activeImageIndex: number;
  handleCloseModal: () => void;
  refetch: () => void;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
}) => {
  //  const [showNotes, setShowNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const { mutate: deleteImage } = useRemoveImage();
  const imageUrl = item.url;
  const { data: comments } = useGetComments(item.id);
  const noteCount = comments?.length || 0;
  const { mutate: removeImage } = useRemoveImage();
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: updateImage } = useUpdateImage();
  const { data: user } = useCurrentUser();
  const [editorOpen, setEditorOpen] = useState(false);

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

  // Add toggleIncludeInReport function
  const handleToggleIncludeInReport = async (image: Image) => {
    try {
      setIsUpdatingReport(true);
      const response = await bulkUpdateImages({
        projectId,
        filters: {
          ids: [image.id],
          type: "ROOM",
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

  const currentTags = item.tags || [];
  const hasTags = currentTags.length > 0;

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
          <Trash2Icon size={24} color="#fff" opacity={isDeleting ? 0.5 : 1} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setEditorOpen(true)}
        >
          <Pencil size={24} color="#fff" />
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
            <LoaderIcon size={24} color="#fff" />
          ) : (
            <StarIcon
              size={24}
              color="#fff"
              fill={item.showInReport ? "#FBBF24" : "transparent"}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowTagsModal(true)}
        >
          <TagIcon size={24} color="#fff" />
          {hasTags && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>{currentTags.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowNotes(true)}
        >
          <MessageCircleIcon size={24} color="#fff" />
          {noteCount > 0 && (
            <View style={styles.noteBadge}>
              <Text style={styles.noteBadgeText}>{noteCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ImageTagsModal
        visible={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        imageId={item.id}
        currentTags={currentTags}
        onTagsUpdated={() => {
          refetch();
          // Refresh the image data
          // This will trigger a re-render with updated tags
        }}
      />

      <ImageEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        imageUrl={imageUrl}
        onSave={async (base64) => {
          try {
            const fileUri = await base64ToFile(base64);
            const { publicUrl } = await uploadFile(
              {
                uri: fileUri,
                path: fileUri,
                size: 100,
                name: "image.png",
                type: "image/png",
              } as any,
              "image.png"
            );
            await updateImage({
              imageId: item.id,
              data: {
                url: publicUrl,
              },
            });
            await FileSystem.deleteAsync(fileUri);
            toast.success("Image updated successfully");
          } catch (error) {
            console.error("Error updating image:", error);
            toast.error("Failed to update image");
          }
        }}
      />
    </View>
  );
};

// Render image in the modal
const ModalItemMetadata = ({
  item,
  activeImageIndex,
  setActiveImageIndex,
  modalScrollRef,
  images,
  showNotes,
  setShowNotes,
}: {
  item: Image;
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  modalScrollRef: React.RefObject<FlatList<Image>>;
  images: Image[];
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(item.description || "");

  const { mutate: updateImage } = useUpdateImage();
  useEffect(() => {
    setDescription(item.description || "");
  }, [item.description]);

  const handleUpdateDescription = async (newDescription: string) => {
    try {
      await updateImage({
        imageId: item.id,
        data: {
          description: newDescription,
        },
      });
      setDescription(newDescription);
      setIsEditingDescription(false);
      toast.success("Description updated successfully");
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
    }
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

  return (
    <>
      {/* Image Metadata */}
      <View style={styles.imageMetadata} className="flex-col w-full ">
        <View style={styles.uploaderInfo}>
          <Text style={styles.uploaderName}>
            By {item.byUser?.firstName || "Unknown"}{" "}
            {item.byUser?.lastName || "User"}
          </Text>
          <Text style={styles.uploadDate}>
            {dayjs(item.createdAt).format("MM/DD/YYYY hh:mm A")}
          </Text>
        </View>
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={goToPreviousImage}
            style={[
              styles.navButton,
              activeImageIndex === 0 && styles.navButtonDisabled,
            ]}
            disabled={activeImageIndex === 0}
          >
            <ChevronLeftIcon
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
            <ChevronRightIcon
              size={30}
              color={activeImageIndex === images.length - 1 ? "#666" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {description ? (
          <CollapsibleDescription
            text={description}
            onPress={() => setIsEditingDescription(true)}
          />
        ) : (
          <TouchableOpacity
            style={styles.descriptionContainer}
            onPress={() => setIsEditingDescription(true)}
          >
            <Text style={styles.addDescriptionText}>Add description...</Text>
          </TouchableOpacity>
        )}
      </View>
      <NotesModal
        isVisible={showNotes}
        onClose={() => setShowNotes(false)}
        imageId={item.id}
        // comments={comments || []}
      />
      {/* Description Edit Modal */}
      <DescriptionEditModal
        isVisible={isEditingDescription}
        onClose={() => setIsEditingDescription(false)}
        initialDescription={description}
        onSave={handleUpdateDescription}
      />
    </>
  );
};
