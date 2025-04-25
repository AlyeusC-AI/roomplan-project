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
import ModalImagesWithNotes from "../pictures/modalImagesWithNotes";

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Type for inference objects
export interface Inference {
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
  const [selectedKeys, setSelectedKeys] =
    useState<string[]>(initialSelectedKeys);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const [images, setImages] = useState<Inference[]>(inferences);
  useEffect(() => {
    setImages(inferences);
  }, [inferences]);

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

      // Update order in backend
      const orderUpdates = newOrder.map((inference, idx) => ({
        publicId: inference.publicId,
        order: idx,
      }));

      fetch(`/api/v1/projects/${inferences[0]?.projectId}/images`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: orderUpdates.map((update) => update.publicId),
          order: orderUpdates,
        }),
      }).catch((error) => {
        console.error("Failed to update image order:", error);
      });
    }
  };

  // Handle image press to open modal
  const handleImagePress = (index: number) => {
    setActiveImageIndex(index);
    setModalVisible(true);
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
      <ModalImagesWithNotes
        images={images}
        urlMap={urlMap}
        onRefresh={onRefresh}
        roomName={roomName}
        onAddNote={onAddNote}
        onToggleIncludeInReport={onToggleIncludeInReport}
        onDelete={onDelete}
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        activeImageIndex={activeImageIndex}
        setActiveImageIndex={setActiveImageIndex}
      />
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
