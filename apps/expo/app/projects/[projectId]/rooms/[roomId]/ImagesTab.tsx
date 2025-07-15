import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  useSearchImages,
  useGetRooms,
  useGetTags,
  useBulkUpdateImages,
  useBulkRemoveImages,
  useAddImageTags,
  useAddImage,
} from "@service-geek/api-client";
import {
  Filter,
  CheckSquare,
  X,
  Camera,
  ImagePlus,
  Wifi,
  WifiOff,
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { toast } from "sonner-native";
import { useRouter } from "expo-router";
import {
  takePhoto,
  pickMultipleImages,
  STORAGE_BUCKETS,
} from "@/lib/utils/imageModule";
import { useOfflineUploadsStore } from "@/lib/state/offline-uploads";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";

// Type assertions to fix ReactNode compatibility
const FilterIcon = Filter as any;
const CheckSquareIcon = CheckSquare as any;
const XIcon = X as any;
const CameraIcon = Camera as any;
const ImagePlusIcon = ImagePlus as any;
const WifiIcon = Wifi as any;
const WifiOffIcon = WifiOff as any;

// Import the enhanced components
import FilteredImagesGallery from "@/components/pictures/FilteredImagesGallery";
import SelectionMode from "@/components/pictures/SelectionMode";
import BulkActionsModal from "@/components/pictures/BulkActionsModal";
import SaveToPhoneModal from "@/components/pictures/SaveToPhoneModal";

export default function ImagesTab({
  projectId,
  roomId,
  room,
}: {
  projectId: string;
  roomId: string;
  room: any;
}) {
  // Filter state
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | "all">(
    "all"
  );
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"room" | "tags">("room");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigningRoom, setIsAssigningRoom] = useState(false);
  const [isAssigningTags, setIsAssigningTags] = useState(false);

  // Save to phone state
  const [showSaveToPhoneModal, setShowSaveToPhoneModal] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shouldOpenCamera, setShouldOpenCamera] = useState(false);

  const router = useRouter();
  const { mutate: addImage } = useAddImage();
  const { isOffline } = useNetworkStatus();
  const { addToQueue } = useOfflineUploadsStore();

  const { data: imagesData, refetch } = useSearchImages(
    projectId,
    { type: "ROOM" },
    { direction: "asc", field: "order" },
    { page: 1, limit: 100 }
  );

  // Data hooks for filtering and bulk actions
  const { data: rooms } = useGetRooms(projectId);
  const { data: tags } = useGetTags({ type: "IMAGE" });
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: bulkRemoveImages } = useBulkRemoveImages();
  const { mutateAsync: addImageTags } = useAddImageTags();

  const images = useMemo(
    () => imagesData?.data?.filter((img) => img.roomId === roomId) || [],
    [imagesData, roomId]
  );

  // Selection mode handlers
  const handleSelectionChange = (selectedKeys: string[]) => {
    const selectedImages = images.filter((photo: any) =>
      selectedKeys.includes(photo.id)
    );
    setSelectedPhotos(selectedImages);
  };

  const clearSelection = () => {
    setSelectedPhotos([]);
    setIsSelectionMode(false);
  };

  const handleAssignRoom = async (roomId: string) => {
    try {
      setIsAssigningRoom(true);
      await bulkUpdateImages({
        projectId,
        filters: {
          type: "ROOM",
          ids: selectedPhotos.map((p) => p.id),
        },
        updates: { roomId },
      });
      toast.success("Room assigned successfully");
      clearSelection();
      setShowBulkActionsModal(false);
      refetch();
    } catch (error) {
      console.error("Error assigning room:", error);
      toast.error("Failed to assign room");
    } finally {
      setIsAssigningRoom(false);
    }
  };

  const handleAssignTags = async (tagNames: string[]) => {
    try {
      setIsAssigningTags(true);
      // Add tags to all selected images
      const promises = selectedPhotos.map(
        async (photo) =>
          await addImageTags({
            imageId: photo.id,
            tagNames,
          })
      );

      await Promise.all(promises);
      await refetch();
      toast.success("Tags assigned successfully");
      clearSelection();
      setShowBulkActionsModal(false);
    } catch (error) {
      console.error("Error assigning tags:", error);
      toast.error("Failed to assign tags");
    } finally {
      setIsAssigningTags(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await bulkRemoveImages({
        projectId,
        filters: {
          type: "ROOM",
          ids: selectedPhotos.map((p) => p.id),
        },
      });
      toast.success("Images deleted successfully");
      clearSelection();
      refetch();
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveToPhone = () => {
    setShowSaveToPhoneModal(true);
  };

  const handleSaveToPhoneComplete = () => {
    // Optionally clear selection after saving
    // clearSelection();
  };

  // Upload functions
  const uploadToSupabase = async (imagePath: string) => {
    console.log("🚀 ~ uploadToSupabase ~ imagePath:", imagePath, roomId);

    if (isOffline) {
      // Add to offline queue when offline
      addToQueue({
        projectId,
        roomId,
        imagePath,
        imageUrl: imagePath,
        metadata: {
          size: 0,
          type: "image/jpeg",
          name: "offline-image",
        },
      });
      toast.success("Image added to offline queue");
      setUploadProgress((prev) => prev + 1);
      return true;
    }

    try {
      await addImage({
        data: {
          url: imagePath,
          roomId: roomId,
          projectId,
        },
      });

      setUploadProgress((prev) => prev + 1);
      return true;
    } catch (error) {
      console.error("Upload error:", error);

      // If upload fails, add to offline queue as fallback
      addToQueue({
        projectId,
        roomId,
        imagePath,
        imageUrl: imagePath,
        metadata: {
          size: 0,
          type: "image/jpeg",
          name: "failed-upload",
        },
      });
      toast.error("Upload failed, added to offline queue");
      return false;
    }
  };

  const handleTakePhoto = async () => {
    try {
      setShouldOpenCamera(true);

      await takePhoto(roomId, {
        bucket: STORAGE_BUCKETS.PROJECT,
        pathPrefix: `projects/${projectId}/rooms`,
        compression: "high",
        projectId,
        roomId: roomId,
        isOffline,
        addToOfflineQueue: addToQueue,
        onSuccess: async (file) => {
          // Only upload to backend if not offline and file has a URL
          if (!isOffline && file.url && file.url !== file.path) {
            await uploadToSupabase(file.url);
          }
          // Refetch images after upload
          await refetch();
        },
      });
      setShouldOpenCamera(false);
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Failed to take photo");
    }
  };

  const handlePickImages = async () => {
    try {
      setShouldOpenCamera(false);

      setIsUploading(true);
      setUploadProgress(0);

      await pickMultipleImages(roomId, {
        bucket: STORAGE_BUCKETS.PROJECT,
        pathPrefix: `projects/${projectId}/rooms`,
        compression: "medium",
        maxImages: 20,
        projectId,
        roomId: roomId,
        isOffline,
        addToOfflineQueue: addToQueue,
        onSuccess: async (files) => {
          for (const file of files) {
            console.log("🚀 ~ onSuccess: ~ file:", file);
            // Only upload to backend if not offline and file has a URL
            if (!isOffline && file.url && file.url !== file.path) {
              await uploadToSupabase(file.url);
            }
          }
          // Refetch images after upload
          await refetch();
        },
      });
    } catch (error) {
      console.error("Error picking images:", error);
      toast.error("Failed to pick images");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!images.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>No images for this room yet.</Text>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <WifiOffIcon size={16} color="#ef4444" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                isUploading && styles.uploadButtonDisabled,
              ]}
              onPress={handlePickImages}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ImagePlusIcon size={20} color="#fff" />
              )}
              <Text style={styles.uploadButtonText}>Add Images</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadButton, styles.cameraButton]}
              onPress={handleTakePhoto}
            >
              <CameraIcon size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with selection and filter controls */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Room Images</Text>
            {isOffline && (
              <View style={styles.offlineIndicator}>
                <WifiOffIcon size={16} color="#ef4444" />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isUploading && styles.actionButtonDisabled,
            ]}
            onPress={handlePickImages}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <ImagePlusIcon size={20} color="#2563eb" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTakePhoto}
          >
            <CameraIcon size={20} color="#2563eb" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isSelectionMode && styles.actionButtonActive,
            ]}
            onPress={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) {
                setSelectedPhotos([]);
              }
            }}
          >
            <Text
              style={[
                styles.actionButtonText,
                isSelectionMode && styles.actionButtonTextActive,
              ]}
            >
              {isSelectionMode ? "Cancel" : "Select"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <FilterIcon size={20} color="#2563eb" />
            {selectedTagFilters.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {selectedTagFilters.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Selection Mode UI */}
      {isSelectionMode && selectedPhotos.length > 0 && (
        <SelectionMode
          selectedPhotos={selectedPhotos}
          onClearSelection={clearSelection}
          onAssignRoom={() => {
            setBulkActionType("room");
            setShowBulkActionsModal(true);
          }}
          onAssignTags={() => {
            setBulkActionType("tags");
            setShowBulkActionsModal(true);
          }}
          onDelete={handleDelete}
          onSaveToPhone={handleSaveToPhone}
          isDeleting={isDeleting}
          isAssigningRoom={isAssigningRoom}
        />
      )}

      {/* Images Gallery with filtering and selection */}
      <FilteredImagesGallery
        images={images}
        selectable={isSelectionMode}
        onSelectionChange={handleSelectionChange}
        initialSelectedKeys={selectedPhotos.map((p) => p.id)}
        rooms={rooms || []}
        tags={tags || []}
        refetch={refetch}
        showFilterControls={true}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onFilterChange={(filters) => {
          setSelectedRoomFilter(filters.roomFilter);
          setSelectedTagFilters(filters.tagFilters);
        }}
        hideRoomFilter={true}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        visible={showBulkActionsModal}
        onClose={() => setShowBulkActionsModal(false)}
        action={bulkActionType}
        selectedPhotos={selectedPhotos}
        onAssignRoom={handleAssignRoom}
        onAssignTags={handleAssignTags}
        isAssigningRoom={isAssigningRoom}
        isAssigningTags={isAssigningTags}
      />

      {/* Save to Phone Modal */}
      <SaveToPhoneModal
        visible={showSaveToPhoneModal}
        onClose={() => setShowSaveToPhoneModal(false)}
        selectedPhotos={selectedPhotos}
        onComplete={handleSaveToPhoneComplete}
      />

      {/* FAB for camera access */}
      {images.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            onPress={() => router.push("../camera")}
            style={[styles.fab, isUploading && styles.fabDisabled]}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <CameraIcon size={30} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    // position: "relative",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    fontStyle: "italic",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#fef3f2",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  offlineText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    width: "45%",
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  cameraButton: {
    backgroundColor: "#10b981",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  actionButtonTextActive: {
    color: "#fff",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabDisabled: {
    opacity: 0.7,
  },
});
