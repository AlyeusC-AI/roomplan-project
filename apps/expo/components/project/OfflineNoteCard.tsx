import React, { useState, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import {
  Edit2,
  Trash2,
  Camera,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Mic,
  Square,
  ChevronUp,
  ChevronDown,
  FileText,
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner-native";
import * as ImagePicker from "expo-image-picker";
import { useOfflineNotesStore, OfflineNote } from "@/lib/state/offline-notes";
import { useOfflineUploadsStore } from "@/lib/state/offline-uploads";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { format } from "date-fns";

// Type assertions to fix ReactNode compatibility
const ExpoImageComponent = ExpoImage as any;
const Edit2Component = Edit2 as any;
const Trash2Component = Trash2 as any;
const CameraComponent = Camera as any;
const ImageIconComponent = ImageIcon as any;
const XComponent = X as any;
const ChevronLeftComponent = ChevronLeft as any;
const ChevronRightComponent = ChevronRight as any;
const MicComponent = Mic as any;
const SquareComponent = Square as any;
const ChevronUpComponent = ChevronUp as any;
const ChevronDownComponent = ChevronDown as any;
const FileTextComponent = FileText as any;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface OfflineNoteCardProps {
  note: OfflineNote;
  roomId: string;
  projectId: string;
}

export default function OfflineNoteCard({
  note,
  roomId,
  projectId,
}: OfflineNoteCardProps) {
  const [tempNote, setTempNote] = useState(note.body);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [showImageModal, setShowImageModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [expandedImageGrid, setExpandedImageGrid] = useState(false);
  const [highlightedImageIndex, setHighlightedImageIndex] = useState<
    number | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [noteId, setNoteId] = useState("");
  const [transcript, setTranscript] = useState("");

  const {
    updateOfflineNote,
    addImageToOfflineNote,
    removeImageFromOfflineNote,
    removeFromQueue,
  } = useOfflineNotesStore();
  const { addToQueue: addImageToUploadQueue } = useOfflineUploadsStore();
  const { isOffline } = useNetworkStatus();

  const PREVIEW_IMAGE_COUNT = 4;

  const handleSave = () => {
    updateOfflineNote(note.id, tempNote);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
    toast.success("Note updated");
  };

  const handleCancel = () => {
    setTempNote(note.body);
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeFromQueue(note.id);
          toast.success("Note removed");
        },
      },
    ]);
  };

  const handleTakePhoto = async () => {
    try {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        toast.error("Camera permission is required");
        return;
      }

      setIsUploadingImage(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const imagePath = result.assets[0].uri;

        if (isOffline) {
          // Add to offline note directly
          addImageToOfflineNote(note.id, imagePath);
          toast.success("Image added to offline note");
        } else {
          // Add to upload queue for processing
          addImageToUploadQueue({
            projectId,
            roomId,
            imagePath,
            imageUrl: imagePath,
            metadata: {
              size: result.assets[0].fileSize || 0,
              type: result.assets[0].type || "image/jpeg",
              name: `note-image-${Date.now()}`,
            },
          });
          toast.success("Image queued for upload");
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Failed to take photo");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const libraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryPermission.status !== "granted") {
        toast.error("Media library permission is required");
        return;
      }

      setIsUploadingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets?.length > 0) {
        for (const asset of result.assets) {
          const imagePath = asset.uri;

          if (isOffline) {
            // Add to offline note directly
            addImageToOfflineNote(note.id, imagePath);
          } else {
            // Add to upload queue for processing
            addImageToUploadQueue({
              projectId,
              roomId,
              imagePath,
              imageUrl: imagePath,
              metadata: {
                size: asset.fileSize || 0,
                type: asset.type || "image/jpeg",
                name: `note-image-${Date.now()}`,
              },
            });
          }
        }

        toast.success(`${result.assets.length} image(s) added`);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      toast.error("Failed to pick images");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageOptions = () => {
    Alert.alert(
      "Add Images",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "Choose from Gallery",
          onPress: handlePickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteImage = (imagePath: string) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          removeImageFromOfflineNote(note.id, imagePath);
          toast.success("Image removed");
        },
      },
    ]);
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!note.images || note.images.length === 0) return;

    const currentIndex = selectedImageIndex || 0;
    let newIndex: number;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : note.images.length - 1;
    } else {
      newIndex = currentIndex < note.images.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedImageIndex(newIndex);
  };

  const renderImages = () => {
    if (!note.images || note.images.length === 0) return null;

    return (
      <View style={styles.imageGrid}>
        {note.images.map((imagePath, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageContainer}
            onPress={() => handleImagePress(index)}
          >
            <ExpoImageComponent
              source={{ uri: imagePath }}
              style={styles.gridImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <TouchableOpacity
              style={styles.deleteImageButton}
              onPress={() => handleDeleteImage(imagePath)}
            >
              <XComponent size={12} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <>
      <Card style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <FileTextComponent color="#1E40AF" size={20} />
            </View>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 13 }}>
                {format(new Date(note.createdAt), "d LLLL	hh:mm a")}
              </Text>
            </View>
          </View>

          {/* Action buttons moved to the top */}
          <View style={{ flexDirection: "row", gap: 0 }}>
            <Button
              variant="ghost"
              className="p-1"
              disabled={isSaving || isUploadingImage}
              onPress={() => {
                // Speech recognition placeholder for offline notes
                toast.info(
                  "Speech recognition not available for offline notes"
                );
              }}
            >
              {recognizing && note.id == noteId ? (
                <SquareComponent color="red" size={20} />
              ) : (
                <MicComponent color="#1e40af" size={20} />
              )}
            </Button>

            {/* Combined image button for camera and gallery */}
            <Button
              variant="ghost"
              className="p-1"
              disabled={isSaving || isUploadingImage}
              onPress={handleImageOptions}
            >
              {isUploadingImage ? (
                <ActivityIndicator size="small" color="#1e40af" />
              ) : (
                <CameraComponent color="#1e40af" size={20} />
              )}
            </Button>

            {/* Delete button with confirmation */}
            <Button
              variant="ghost"
              className="p-1"
              disabled={isDeleting}
              onPress={handleDelete}
            >
              {isDeleting ? (
                <ActivityIndicator />
              ) : (
                <Trash2Component color="red" size={20} />
              )}
            </Button>
          </View>
        </View>

        {/* Always show textarea for direct editing */}
        <View style={{ position: "relative" }}>
          <Textarea
            value={tempNote}
            onChangeText={setTempNote}
            placeholder="What's on your mind?"
            style={{
              minHeight: 80,
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: isSaving ? "#93C5FD" : "#E5E7EB",
              fontSize: 16,
            }}
            multiline
            onBlur={() => {
              // Save changes when focus is lost
              if (tempNote !== note.body) {
                handleSave();
              }
            }}
          />
          {isSaving && (
            <View
              style={{
                position: "absolute",
                bottom: 24,
                right: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: 4,
                padding: 4,
              }}
            >
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={{ marginRight: 4 }}
              />
              <Text style={{ fontSize: 12, color: "#2563eb" }}>Saving...</Text>
            </View>
          )}
        </View>

        {/* Images display */}
        {renderImages()}
      </Card>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={closeImageModal}
                style={styles.closeButton}
              >
                <XComponent size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {note.images && selectedImageIndex !== null && (
              <View style={styles.modalImageContainer}>
                <ExpoImageComponent
                  source={{ uri: note.images[selectedImageIndex] }}
                  style={styles.modalImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>
            )}

            {note.images && note.images.length > 1 && (
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateImage("prev")}
                >
                  <ChevronLeftComponent size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>
                  {selectedImageIndex !== null ? selectedImageIndex + 1 : 1} /{" "}
                  {note.images.length}
                </Text>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateImage("next")}
                >
                  <ChevronRightComponent size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  noteCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  editContainer: {
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  editButton: {
    minWidth: 80,
  },
  noteText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  singleImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  imageContainer: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  deleteImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(220, 38, 38, 0.8)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  imageActions: {
    marginTop: 8,
  },
  imageActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.3)",
  },
  imageActionText: {
    color: "#2563eb",
    fontWeight: "500",
  },
  loadingText: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: screenWidth,
    height: screenHeight - 200,
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
    backgroundColor: "rgba(37, 99, 235, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  pageIndicator: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
