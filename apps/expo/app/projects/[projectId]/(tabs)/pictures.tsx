import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { Image as ExpoImage } from "expo-image";

// Type assertion to fix ReactNode compatibility
const ExpoImageComponent = ExpoImage as any;
import { Camera } from "react-native-vision-camera";
import {
  Camera as CameraIcon,
  ImagePlus,
  Plus,
  Image as ImageIcon,
  Building2,
  ArrowDownToLine,
  Star,
  Loader,
  Home,
  XCircle,
  Filter,
  CheckSquare,
  Wifi,
  WifiOff,
} from "lucide-react-native";
import { useFocusEffect, useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import Empty from "@/components/project/empty";

import { Text } from "@/components/ui/text";

import { Button } from "@/components/ui/button";
import ImageGallery, { Inference } from "@/components/project/ImageGallery";
import {
  takePhoto,
  pickMultipleImages,
  STORAGE_BUCKETS,
  getStorageUrl,
} from "@/lib/utils/imageModule";
import safelyGetImageUrl from "@/utils/safelyGetImageKey";

import AddRoomButton from "@/components/project/AddRoomButton";
import { launchImageLibraryAsync } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { api } from "@/lib/api";
import {
  useAddComment,
  useAddImage,
  useCurrentUser,
  useGetProjectById,
  useGetRooms,
  useSearchImages,
  useUpdateImagesOrder,
  useBulkRemoveImages,
  useBulkUpdateImages,
  useRemoveImage,
  useUpdateProject,
  useGetTags,
  useAddImageTags,
} from "@service-geek/api-client";
import { uploadImage } from "@/lib/imagekit";
import { useOfflineUploadsStore } from "@/lib/state/offline-uploads";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";

// Type assertions to fix ReactNode compatibility
const CameraIconComponent = CameraIcon as any;
const ImagePlusComponent = ImagePlus as any;
const ImageIconComponent = ImageIcon as any;
const Building2Component = Building2 as any;
const StarComponent = Star as any;
const LoaderComponent = Loader as any;
const HomeComponent = Home as any;
const XCircleComponent = XCircle as any;
const FilterComponent = Filter as any;
const WifiComponent = Wifi as any;
const WifiOffComponent = WifiOff as any;

export default function ProjectPhotos() {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const [expandedValue, setExpandedValue] = useState<string | undefined>(
    undefined
  );
  const { data } = useGetProjectById(projectId);
  const project = data?.data;
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [shouldOpenCamera, setShouldOpenCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  const router = useRouter();
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const { mutate: addImage } = useAddImage();
  const { isOffline } = useNetworkStatus();
  const { addToQueue } = useOfflineUploadsStore();

  const { data: rooms } = useGetRooms(projectId);
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: updateProject } = useUpdateProject();

  const {
    data: images,
    isLoading: loading,
    refetch,
    isRefetching,
  } = useSearchImages(
    projectId,
    {
      type: "ROOM",
    },
    {
      direction: "asc",
      field: "order",
    },
    { page: 1, limit: 100 }
  );

  const onCreateRoom = async () => {
    router.navigate({
      pathname: "../rooms/create",
      params: { projectId, projectName: project?.name },
    });
  };

  useEffect(() => {
    if (selectedRoom) {
      if (shouldOpenCamera) {
        handleTakePhoto();
      } else {
        handlePickImages();
      }
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (project?.mainImage) {
      setMainImage(project.mainImage);
    }
  }, [project]);

  const uploadToSupabase = async (imagePath: string, roomId: string) => {
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
      if (!selectedRoom) {
        setShowRoomSelection(true);
        return;
      }

      await takePhoto(selectedRoom, {
        bucket: STORAGE_BUCKETS.PROJECT,
        pathPrefix: `projects/${projectId}/rooms`,
        compression: "high",
        projectId,
        roomId: selectedRoom,
        isOffline,
        addToOfflineQueue: addToQueue,
        onSuccess: async (file) => {
          // Only upload to backend if not offline and file has a URL
          if (!isOffline && file.url && file.url !== file.path) {
            await uploadToSupabase(file.url, selectedRoom);
          }
        },
      });
      setShouldOpenCamera(false);
      setSelectedRoom(null);
      setShowRoomSelection(false);
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Failed to take photo");
    }
  };

  const handlePickImages = async () => {
    try {
      setShouldOpenCamera(false);
      if (!selectedRoom) {
        setShowRoomSelection(true);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      await pickMultipleImages(selectedRoom, {
        bucket: STORAGE_BUCKETS.PROJECT,
        pathPrefix: `projects/${projectId}/rooms`,
        compression: "medium",
        maxImages: 20,
        projectId,
        roomId: selectedRoom,
        isOffline,
        addToOfflineQueue: addToQueue,
        onSuccess: async (files) => {
          for (const file of files) {
            console.log("🚀 ~ onSuccess: ~ file:", file);
            // Only upload to backend if not offline and file has a URL
            if (!isOffline && file.url && file.url !== file.path) {
              await uploadToSupabase(file.url, selectedRoom);
            }
          }
        },
      });
    } catch (error) {
      console.error("Error picking images:", error);
      toast.error("Failed to pick images");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedRoom(null);
    }
  };

  const includeAllInReport = async () => {
    try {
      setIsUpdatingAll(true);
      await bulkUpdateImages({
        projectId,
        filters: {
          type: "ROOM",
          ids: images?.data?.map((image) => image.id) || [],
        },
        updates: {
          showInReport: true,
        },
      });

      toast.success("All images included in report");
    } catch (error) {
      console.error("Error updating images:", error);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  // Add function to check if all images are included in report
  const areAllImagesIncluded = images?.data?.every(
    (image) => image.showInReport
  );

  const handleSetMainImage = async (useCamera: boolean = false) => {
    try {
      setIsUploadingMainImage(true);

      let result;
      if (useCamera) {
        // Request camera permissions
        const cameraPermission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (cameraPermission.status !== "granted") {
          toast.error("Camera permission is required to take photos");
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      } else {
        result = await launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];

        const uploadResult = await uploadImage(file, {
          folder: `projects/${projectId}/main`,
        });

        if (uploadResult.url) {
          updateProject({
            id: projectId,
            data: {
              mainImage: uploadResult.url,
            },
          });

          setMainImage(uploadResult.url);
          toast.success("Cover image updated successfully");
        }
      }
    } catch (error) {
      console.error("Error setting main image:", error);
      toast.error("Failed to set cover image");
    } finally {
      setIsUploadingMainImage(false);
    }
  };

  const handleNavigateToFilteredImages = () => {
    router.navigate({
      pathname: "../filtered-images",
      params: { projectId, projectName: project?.name },
    });
  };

  if (loading && !rooms?.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!loading && !rooms?.length) {
    return (
      <Empty
        title="No Images"
        description="Upload images to associate with this project. Images of rooms can be automatically assigned a room"
        buttonText="Create a room"
        icon={<CameraIconComponent height={50} width={50} />}
        secondaryIcon={
          <CameraIconComponent
            height={20}
            width={20}
            color="#fff"
            className="ml-4"
          />
        }
        onPress={onCreateRoom}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Project Photos</Text>
              {isOffline && (
                <View style={styles.offlineIndicator}>
                  <WifiOffComponent size={16} color="#ef4444" />
                  <Text style={styles.offlineText}>Offline</Text>
                </View>
              )}
            </View>
            <AddRoomButton showText={false} size="sm" />
          </View>

          <View style={styles.headerBottom}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isUploadingMainImage && styles.actionButtonDisabled,
                ]}
                onPress={() => setShowCoverModal(true)}
                disabled={isUploadingMainImage}
              >
                {isUploadingMainImage ? (
                  <LoaderComponent size={20} color="#2563eb" />
                ) : (
                  <HomeComponent size={20} color="#2563eb" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isUpdatingAll && styles.actionButtonDisabled,
                ]}
                onPress={includeAllInReport}
                disabled={isUpdatingAll || !rooms?.length}
              >
                {isUpdatingAll ? (
                  <LoaderComponent size={20} color="#2563eb" />
                ) : (
                  <StarComponent
                    size={20}
                    color={areAllImagesIncluded ? "#FBBF24" : "#2563eb"}
                    fill={areAllImagesIncluded ? "#FBBF24" : "transparent"}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isOffline && styles.actionButtonOffline,
                ]}
                onPress={handlePickImages}
              >
                <ImagePlusComponent
                  size={20}
                  color={isOffline ? "#f59e0b" : "#2563eb"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={handleNavigateToFilteredImages}
              >
                <FilterComponent size={18} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Show room-grouped view */}
        <View style={styles.roomsContainer}>
          {rooms?.map((room) => {
            const imagePerRoom = images?.data?.filter(
              (image) => image.roomId === room.id
            );
            const previewImageUrl = imagePerRoom?.[0]?.url;
            const imageCount = imagePerRoom?.length || 0;

            return (
              <TouchableOpacity
                key={room.name}
                style={styles.roomCard}
                onPress={() => {
                  setExpandedValue(
                    expandedValue === room.name ? undefined : room.name
                  );
                }}
              >
                <View style={styles.roomCardContent}>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.imageCount}>
                      {imageCount} {imageCount === 1 ? "image" : "images"}
                    </Text>
                  </View>

                  {previewImageUrl ? (
                    <ExpoImageComponent
                      source={{ uri: previewImageUrl }}
                      style={styles.roomPreviewImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={styles.roomPreviewPlaceholder}>
                      <ImageIconComponent size={24} color="#9CA3AF" />
                    </View>
                  )}
                </View>

                {expandedValue === room.name && (
                  <View style={styles.galleryContainer}>
                    <ImageGallery
                      images={imagePerRoom || []}
                      room={room}
                      refetch={refetch}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {(rooms?.length || 0) > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            onPress={() => router.push("../camera")}
            style={[styles.fab, isUploading && styles.fabDisabled]}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <CameraIconComponent size={30} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showRoomSelection}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoomSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Building2Component size={24} color="#2563eb" />
                <Text style={styles.modalTitle}>Select Room</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowRoomSelection(false);
                  setSelectedRoom(null);
                }}
              >
                <XCircleComponent size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Choose a room to upload images to
              </Text>

              <View style={styles.roomList}>
                {rooms?.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.roomOption,
                      selectedRoom === room.id && styles.selectedRoom,
                    ]}
                    onPress={() => {
                      setSelectedRoom(room.id);
                      setShowRoomSelection(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.roomOptionText,
                        selectedRoom === room.id && styles.selectedRoomText,
                      ]}
                    >
                      {room.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCoverModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCoverModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <HomeComponent size={24} color="#2563eb" />
                <Text style={styles.modalTitle}>Project Cover</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCoverModal(false)}
              >
                <XCircleComponent size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {mainImage ? (
                <View style={styles.coverPreview}>
                  <ExpoImageComponent
                    source={{ uri: mainImage }}
                    style={styles.coverImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.coverOverlay}>
                    <Text style={styles.coverOverlayText}>Current Cover</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.coverPlaceholder}>
                  <HomeComponent size={48} color="#94a3b8" />
                  <Text style={styles.coverPlaceholderText}>
                    No cover image set
                  </Text>
                </View>
              )}

              <View className="flex-row gap-1">
                <TouchableOpacity
                  style={[styles.actionButton, styles.cameraButton]}
                  className="bg-accent rounded-full border border-gray-200 "
                  onPress={() => handleSetMainImage(true)}
                  disabled={isUploadingMainImage}
                >
                  {isUploadingMainImage ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.actionButtonContent}>
                      <CameraIconComponent size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Take Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.libraryButton]}
                  onPress={() => handleSetMainImage(false)}
                  disabled={isUploadingMainImage}
                >
                  {isUploadingMainImage ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.actionButtonContent}>
                      <ImageIconComponent size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        Choose from Library
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  headerTitle: {
    paddingTop: 8,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
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
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonOffline: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  actionButtonActive: {
    backgroundColor: "#2563eb",
  },
  roomsContainer: {
    padding: 12,
  },
  roomCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  roomCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  imageCount: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  roomPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  roomPreviewPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryContainer: {
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  modalBody: {
    padding: 16,
  },
  coverPreview: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  coverOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  coverPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  coverPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginHorizontal: 2,
  },
  cameraButton: {
    backgroundColor: "#2563eb",
    width: "auto",
    paddingHorizontal: 8,
  },
  libraryButton: {
    backgroundColor: "#2563eb",
    width: "auto",
    paddingHorizontal: 8,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  roomList: {
    marginBottom: 20,
  },
  roomSelector: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  roomOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectedRoom: {
    backgroundColor: "#2563eb",
  },
  roomOptionText: {
    fontSize: 16,
    color: "#1e293b",
  },
  selectedRoomText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  fabDisabled: {
    opacity: 0.5,
  },
  uploadProgress: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadProgressText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  mainImageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#f1f5f9",
    marginBottom: 16,
  },
  mainImageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  mainImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainImageEditButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mainImageEditText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  mainImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 12,
  },
  mainImagePlaceholderContent: {
    alignItems: "center",
  },
  mainImagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "500",
  },
});
