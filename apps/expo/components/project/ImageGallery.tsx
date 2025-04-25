import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  FlatList,
  Animated as RNAnimated,
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
import { deleteImage, getStorageUrl } from "@/lib/utils/imageModule";
import safelyGetImageUrl from "@/utils/safelyGetImageKey";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from "react-native-reanimated";

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Type for inference objects
interface Inference {
  id: number;
  imageKey: string | null;
  publicId: string;
  roomId?: number | null;
  createdAt?: string;
  imageId?: number | null;
  isDeleted?: boolean;
  projectId?: number;
  notes?: ImageNote[];
  Image?: {
    id: number;
    publicId: string;
    isDeleted?: boolean;
    ImageNote?: ImageNote[];
    includeInReport?: boolean;
    key?: string;
  };
}

interface ImageNote {
  id: number;
  body: string;
  createdAt: string;
  imageId: number;
  User?: {
    firstName?: string;
    lastName?: string;
  };
}

interface ImageGalleryProps {
  inferences: Inference[];
  urlMap: {
    [imageKey: string]: string;
  };
  onRefresh?: () => Promise<void>;
  roomName?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: string[]) => void;
  initialSelectedKeys?: string[];
  onDelete?: (imageKey: string) => Promise<void>;
  onAddNote?: (imageId: number, note: string) => Promise<void>;
  onToggleIncludeInReport?: (
    publicId: string,
    includeInReport: boolean
  ) => Promise<void>;
  onReorder?: (newOrder: Inference[]) => void;
}

export default function ImageGallery({
  inferences,
  urlMap,
  onRefresh,
  roomName,
  selectable = false,
  onSelectionChange,
  initialSelectedKeys = [],
  onDelete,
  onAddNote,
  onToggleIncludeInReport,
}: ImageGalleryProps) {
  // State for modal visibility and active image
  const [modalVisible, setModalVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedKeys, setSelectedKeys] =
    useState<string[]>(initialSelectedKeys);
  const [showNotes, setShowNotes] = useState(false);
  const notesSheetAnim = useSharedValue(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);

  // Refs for scrolling and input
  const modalScrollRef = useRef<FlatList>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);
  const currentNoteText = useRef("");
  const noteInputRef = useRef<TextInput>(null);
  const [images, setImages] = useState<Inference[]>(inferences);

  // Animation values
  const fadeAnim = useSharedValue(0);

  // Calculate grid layout
  const itemsPerRow = 3;

  // Filter out inferences without imageKey or with undefined urlMap entries
  const validInferences = images.filter(
    (inference): inference is Inference & { imageKey: string } =>
      // !!inference.imageKey &&
      // typeof inference.imageKey === "string" &&
      !inference.isDeleted && !inference.Image?.isDeleted
    //  &&
    // !!inference.imageKey
  );
  console.log("🚀 ~ validInferences:", validInferences);

  // Organize inferences into rows for grid display
  const rows = Array.from({
    length: Math.ceil(validInferences.length / itemsPerRow),
  }).map((_, rowIndex) => {
    const startIndex = rowIndex * itemsPerRow;
    const rowItems = validInferences.slice(
      startIndex,
      startIndex + itemsPerRow
    );
    // Pad the row with null values if needed to maintain 3 columns
    const paddedItems: ((typeof validInferences)[0] | null)[] = [...rowItems];
    while (paddedItems.length < itemsPerRow) {
      paddedItems.push(null);
    }
    return paddedItems;
  });

  // Add state for drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const positions = useSharedValue(
    validInferences.map((_, index) => ({ x: 0, y: 0 }))
  );

  // Handle drag start
  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
  };

  // Handle drag move
  const handleDragMove = (
    index: number,
    translation: { x: number; y: number }
  ) => {
    positions.value = positions.value.map((pos, i) => {
      if (i === index) {
        return {
          x: translation.x,
          y: translation.y,
        };
      }
      return pos;
    });
  };

  // Handle drag end
  const handleDragEnd = (index: number) => {
    setIsDragging(false);
    setDraggedIndex(null);

    // Reset positions with spring animation
    positions.value = positions.value.map((_, i) => ({
      x: 0,
      y: 0,
    }));

    // Calculate the new position based on the drag distance
    const dragDistance = positions.value[index];
    const itemWidth = (SCREEN_WIDTH - 40) / 3;
    const itemHeight = itemWidth; // Since it's square

    // Calculate row and column changes
    const colChange = Math.round(dragDistance.x / itemWidth);
    const rowChange = Math.round(dragDistance.y / itemHeight);

    // Calculate the new index based on row and column changes
    const currentRow = Math.floor(index / 3);
    const currentCol = index % 3;
    const newRow = Math.max(
      0,
      Math.min(currentRow + rowChange, Math.floor(validInferences.length / 3))
    );
    const newCol = Math.max(0, Math.min(currentCol + colChange, 2));
    const newIndex = newRow * 3 + newCol;

    // Only reorder if the position has changed
    if (newIndex !== index) {
      const newOrder = [...validInferences];
      const [movedItem] = newOrder.splice(index, 1);
      newOrder.splice(newIndex, 0, movedItem);
      setImages(newOrder);
    }
  };

  // Animated style for dragged item
  const animatedStyle = (index: number) =>
    useAnimatedStyle(() => {
      const { x, y } = positions.value[index];
      const scale = isDragging && draggedIndex === index ? 1.1 : 1;
      return {
        transform: [{ translateX: x }, { translateY: y }, { scale }],
        zIndex: isDragging && draggedIndex === index ? 1 : 0,
      } as const;
    });

  // Handle image press to open modal
  const handleImagePress = (index: number) => {
    setActiveImageIndex(index);
    setModalVisible(true);

    // Animate fade in
    fadeAnim.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
    });
  };

  // Handle modal close
  const handleCloseModal = () => {
    fadeAnim.value = withSpring(
      0,
      {
        damping: 20,
        stiffness: 90,
      },
      () => {
        setModalVisible(false);
      }
    );
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
    if (activeImageIndex < validInferences.length - 1) {
      const newIndex = activeImageIndex + 1;
      setActiveImageIndex(newIndex);
      modalScrollRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    }
  };

  // Handle image selection toggle
  const toggleImageSelection = (imageKey: string) => {
    let newSelectedKeys: string[];

    if (selectedKeys.includes(imageKey)) {
      newSelectedKeys = selectedKeys.filter((key) => key !== imageKey);
    } else {
      newSelectedKeys = [...selectedKeys, imageKey];
    }

    setSelectedKeys(newSelectedKeys);
    if (onSelectionChange) {
      onSelectionChange(newSelectedKeys);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageKey: string, publicId: string) => {
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
            if (onDelete) {
              await onDelete(publicId);
              handleCloseModal();
              return;
            }
            if (onRefresh) {
              await deleteImage(imageKey, { onRefresh });
              if (
                modalVisible &&
                validInferences[activeImageIndex]?.imageKey === imageKey
              ) {
                handleCloseModal();
              }
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
      notesSheetAnim.value = withSpring(
        0,
        {
          damping: 20,
          stiffness: 90,
        },
        () => setShowNotes(false)
      );
    } else {
      setShowNotes(true);
      notesSheetAnim.value = withSpring(1, {
        damping: 20,
        stiffness: 90,
      });
    }
  };

  const handleAddNote = async (imageId: number, note: string) => {
    if (onAddNote && note.trim()) {
      try {
        setIsAddingNote(true);
        await onAddNote(imageId, note.trim());
        currentNoteText.current = "";
        noteInputRef.current?.clear();
      } finally {
        setIsAddingNote(false);
      }
    }
  };

  // Add toggleIncludeInReport function
  const handleToggleIncludeInReport = async (inference: Inference) => {
    if (!onToggleIncludeInReport || isUpdatingReport) return;

    try {
      setIsUpdatingReport(true);
      await onToggleIncludeInReport(
        inference.Image?.publicId || inference.publicId,
        !inference.Image?.includeInReport
      );
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Error updating image:", error);
      Alert.alert("Error", "Failed to update image");
    } finally {
      setIsUpdatingReport(false);
    }
  };

  // Add this near the top of the file
  const notesSheetStyle = useAnimatedStyle(() => {
    const translateY = notesSheetAnim.value * 600;
    return {
      transform: [{ translateY }],
    } as const;
  });

  // Render image item in the grid
  const renderGridItem = (inference: Inference | null, index: number) => {
    if (!inference || (!inference.imageKey && !inference.Image?.key)) {
      return <View key={`empty-${index}`} style={styles.galleryItem} />;
    }

    const imageKey = inference.imageKey || inference.Image?.key || "";
    let imageUrl = safelyGetImageUrl(urlMap, imageKey, "");
    if (!imageUrl) {
      imageUrl = getStorageUrl(imageKey);
    }

    const isSelected = selectedKeys.includes(imageKey);

    const gestureHandler = useAnimatedStyle(() => {
      const { x, y } = positions.value[index];
      const scale = isDragging && draggedIndex === index ? 1.1 : 1;
      return {
        transform: [{ translateX: x }, { translateY: y }, { scale }],
        zIndex: isDragging && draggedIndex === index ? 1 : 0,
      } as const;
    });

    const onGestureEvent = useAnimatedGestureHandler({
      onStart: () => {
        runOnJS(handleDragStart)(index);
      },
      onActive: (event) => {
        positions.value = positions.value.map((pos, i) => {
          if (i === index) {
            return {
              x: event.translationX,
              y: event.translationY,
            };
          }
          return pos;
        });
      },
      onEnd: () => {
        runOnJS(handleDragEnd)(index);
      },
    });

    return (
      <Animated.View
        key={imageKey}
        style={[styles.galleryItem, gestureHandler]}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          activeOffsetX={[-5, 5]}
          activeOffsetY={[-5, 5]}
        >
          <Animated.View style={styles.gestureContainer}>
            <OptimizedImage
              uri={imageUrl}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              isSelected={isSelected}
              imageKey={imageKey}
              onLongPress={() => handleDragStart(index)}
              onPress={
                selectable
                  ? () => toggleImageSelection(imageKey)
                  : () => {
                      const validIndex = validInferences.findIndex(
                        (item) => item.id === inference.id
                      );
                      if (validIndex >= 0) {
                        handleImagePress(validIndex);
                      }
                    }
              }
            />
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    );
  };

  // Render image in the modal
  const renderModalItem = ({
    item,
    index,
  }: {
    item: Inference & { imageKey: string };
    index: number;
  }) => {
    const imageKey = item.imageKey || item.Image?.key || "";
    let imageUrl = safelyGetImageUrl(urlMap, imageKey, "");
    if (!imageUrl) {
      imageUrl = getStorageUrl(imageKey);
    }

    const noteCount = item.notes?.length || 0;

    return (
      <View style={styles.modalImageContainer}>
        <OptimizedImage
          uri={imageUrl}
          style={styles.modalImage}
          resizeMode="contain"
          imageKey={imageKey}
          showInfo={true}
          backgroundColor="#000000"
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isDeleting && styles.disabledButton]}
            onPress={() =>
              handleDeleteImage(item.imageKey, item.Image?.publicId || "")
            }
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
                fill={item.Image?.includeInReport ? "#FBBF24" : "transparent"}
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
              {item.Image?.ImageNote?.reverse().map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteAvatar}>
                      <Text style={styles.noteAvatarText}>
                        {note.User?.firstName?.charAt(0) || "N"} +
                        {note.User?.lastName?.charAt(0) || "N"}
                      </Text>
                    </View>
                    <View style={styles.noteMetadata}>
                      <Text style={styles.noteAuthor}>
                        {note.User?.firstName} {note.User?.lastName}
                      </Text>
                      <Text style={styles.noteDate}>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.noteText}>{note.body}</Text>
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
                  if (item.Image?.id) {
                    await handleAddNote(
                      item.Image?.id,
                      currentNoteText.current
                    );
                  }
                }}
              />
              <TouchableOpacity
                style={[
                  styles.submitNoteButton,
                  isAddingNote && styles.disabledButton,
                ]}
                onPress={async () => {
                  if (item.Image?.id) {
                    await handleAddNote(
                      item.Image?.id,
                      currentNoteText.current
                    );
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

  // Handle scroll end in modal
  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  // If there are no valid images, show an empty state
  if (validInferences.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ImageIcon size={40} color="#9CA3AF" />
        <Text style={styles.emptyText}>No images available</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Grid Gallery */}
      <View style={styles.galleryGrid}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.galleryRow}>
            {row.map((inference, colIndex) =>
              renderGridItem(inference, rowIndex * itemsPerRow + colIndex)
            )}
          </View>
        ))}
      </View>

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
              data={validInferences}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={activeImageIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              renderItem={renderModalItem}
              keyExtractor={(item) => item.imageKey || item.Image?.key || ""}
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
                {activeImageIndex + 1} / {validInferences.length}
              </Text>

              <TouchableOpacity
                onPress={goToNextImage}
                style={[
                  styles.navButton,
                  activeImageIndex === validInferences.length - 1 &&
                    styles.navButtonDisabled,
                ]}
                disabled={activeImageIndex === validInferences.length - 1}
              >
                <ChevronRight
                  size={30}
                  color={
                    activeImageIndex === validInferences.length - 1
                      ? "#666"
                      : "#fff"
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
                {validInferences.map((inference, index) => {
                  const imageKey =
                    inference.imageKey || inference.Image?.key || "";
                  let imageUrl = safelyGetImageUrl(urlMap, imageKey, "");

                  if (!imageUrl) {
                    imageUrl = getStorageUrl(imageKey);
                  }
                  console.log(
                    "🚀 ~ {validInferences.map ~ imageUrl:",
                    imageUrl
                  );

                  return (
                    <TouchableOpacity
                      key={imageKey}
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
                        imageKey={imageKey}
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
    </GestureHandlerRootView>
  );
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
