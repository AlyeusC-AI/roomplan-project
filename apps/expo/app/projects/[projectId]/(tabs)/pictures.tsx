import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
} from "react-native";
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
import FilterModal from "@/components/pictures/FilterModal";
import SelectionMode from "@/components/pictures/SelectionMode";
import BulkActionsModal from "@/components/pictures/BulkActionsModal";
import FilteredImagesGallery from "@/components/pictures/FilteredImagesGallery";
import SaveToPhoneModal from "@/components/pictures/SaveToPhoneModal";

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
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | "all">(
    "all"
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);

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

  const router = useRouter();
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const { mutate: addImage } = useAddImage();

  const { data: rooms } = useGetRooms(projectId);
  const { data: tags } = useGetTags({ type: "IMAGE" });
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: bulkRemoveImages } = useBulkRemoveImages();
  const { mutate: updateProject } = useUpdateProject();
  const { mutateAsync: addImageTags } = useAddImageTags();

  const {
    data: images,
    isLoading: loading,
    refetch,
    isRefetching,
  } = useSearchImages(
    projectId,
    {
      // roomId: selectedRoom,
      type: "ROOM",
    },
    {
      direction: "asc",
      field: "order",
    },
    { page: 1, limit: 100 }
  );

  // Filter rooms based on selection
  const filteredRooms =
    selectedRoomFilter === "all"
      ? rooms
      : rooms?.filter((room) => room.id === selectedRoomFilter);

  // Filter photos based on room and tag filters (same logic as web)
  const filteredPhotos = useMemo(() => {
    if (!images?.data) return [];

    let filtered = images.data;

    // Apply room filter
    if (selectedRoomFilter !== "all") {
      filtered = filtered.filter(
        (photo) => photo.roomId === selectedRoomFilter
      );
    }

    // Apply tag filters
    if (selectedTagFilters.length > 0) {
      const hasUntaggedFilter = selectedTagFilters.includes("untagged");
      const hasOtherFilters = selectedTagFilters.some(
        (tag) => tag !== "untagged"
      );

      filtered = filtered.filter((photo) => {
        const hasTags = photo.tags && photo.tags.length > 0;
        const photoTagNames = hasTags
          ? photo.tags.map((tag: any) => tag.name)
          : [];

        // If only "untagged" is selected
        if (hasUntaggedFilter && !hasOtherFilters) {
          return !hasTags;
        }

        // If "untagged" and other tags are selected
        if (hasUntaggedFilter && hasOtherFilters) {
          const otherSelectedTags = selectedTagFilters.filter(
            (tag) => tag !== "untagged"
          );
          return (
            !hasTags ||
            otherSelectedTags.some((tag) => photoTagNames.includes(tag))
          );
        }

        // If only other tags are selected
        return selectedTagFilters.some((tag) => photoTagNames.includes(tag));
      });
    }

    return filtered;
  }, [images?.data, selectedRoomFilter, selectedTagFilters]);

  // Check if filters are active
  const hasActiveFilters =
    selectedRoomFilter !== "all" || selectedTagFilters.length > 0;

  // Check if we should show filtered view
  const shouldShowFilteredView = hasActiveFilters || isSelectionMode;

  // Selection mode handlers
  const handleSelectionChange = (selectedKeys: string[]) => {
    const selectedImages = filteredPhotos.filter((photo) =>
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
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    } finally {
      setIsDeleting(false);
    }
  };

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
    try {
      // const imageUrl = await uploadImage(
      //   {
      //     uri: imagePath,
      //     type: "image/jpeg",
      //     name: `${Date.now()}.jpg`,
      //   },
      //   {
      //     folder: `projects/${projectId}/rooms/${roomId}`,
      //   }
      // );
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
      toast.error("Failed to upload image");
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
        // onRefresh: refreshData,
        compression: "high",
        onSuccess: async (file) => {
          await uploadToSupabase(file.path, selectedRoom);
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
        // onRefresh: refreshData,
        compression: "medium",
        maxImages: 20,
        onSuccess: async (files) => {
          for (const file of files) {
            console.log("🚀 ~ onSuccess: ~ file:", file);
            await uploadToSupabase(file.url, selectedRoom);
          }
          // await refreshData();
        },
      });
      // uploadToSupabase(fileUri, selectedRoom);
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
      // toast.error("Failed to update images");
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

        const uploadResult = await uploadImage(
          {
            uri: file.uri,
            type: "image/jpeg",
            name: `${Date.now()}.jpg`,
          },
          {
            folder: `projects/${projectId}/main`,
          }
        );

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
      // setShowCoverModal(false);
    }
  };

  const handleSaveToPhone = () => {
    setShowSaveToPhoneModal(true);
  };

  const handleSaveToPhoneComplete = () => {
    // Optionally clear selection after saving
    // clearSelection();
  };

  if (loading && !rooms?.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#182e43" />
      </View>
    );
  }

  if (!loading && !rooms?.length) {
    return (
      <Empty
        title="No Images"
        description="Upload images to associate with this project. Images of rooms can be automatically assigned a room"
        // buttonText="Start Taking Pictures"
        buttonText="Create a room"
        icon={<CameraIcon height={50} width={50} />}
        secondaryIcon={
          <CameraIcon height={20} width={20} color="#fff" className="ml-4" />
        }
        // onPress={() => router.push("../camera")}
        onPress={onCreateRoom}
      />
    );
  }

  return (
    <View style={styles.container}>
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

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={[
          styles.scrollContent,
          isSelectionMode && selectedPhotos.length > 0 && { paddingTop: 60 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Project Photos</Text>
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
                  <Loader size={20} color="#182e43" />
                ) : (
                  <Home size={20} color="#182e43" />
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
                  <Loader size={20} color="#182e43" />
                ) : (
                  <Star
                    size={20}
                    color={areAllImagesIncluded ? "#FBBF24" : "#182e43"}
                    fill={areAllImagesIncluded ? "#FBBF24" : "transparent"}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePickImages}
              >
                <ImagePlus size={20} color="#182e43" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterButtons}>
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
                <CheckSquare
                  size={18}
                  color={isSelectionMode ? "#fff" : "#182e43"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <Filter size={18} color="#182e43" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Show filtered view when filters are active or in selection mode */}
        {shouldShowFilteredView ? (
          <FilteredImagesGallery
            images={filteredPhotos}
            selectable={isSelectionMode}
            onSelectionChange={handleSelectionChange}
            initialSelectedKeys={selectedPhotos.map((p) => p.id)}
            activeFilters={{
              roomFilter:
                selectedRoomFilter !== "all" ? selectedRoomFilter : undefined,
              tagFilters:
                selectedTagFilters.length > 0 ? selectedTagFilters : undefined,
            }}
            onClearFilters={() => {
              setSelectedRoomFilter("all");
              setSelectedTagFilters([]);
            }}
            onClearTagFilter={(tagToRemove) => {
              if (tagToRemove === "room") {
                setSelectedRoomFilter("all");
              } else {
                setSelectedTagFilters((prev) =>
                  prev.filter((tag) => tag !== tagToRemove)
                );
              }
            }}
            rooms={rooms || []}
          />
        ) : (
          /* Show room-grouped view when no filters are active */
          <View style={styles.roomsContainer}>
            {filteredRooms?.map((room) => {
              const imagePerRoom = filteredPhotos?.filter(
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
                      <Image
                        source={{ uri: previewImageUrl }}
                        style={styles.roomPreviewImage}
                      />
                    ) : (
                      <View style={styles.roomPreviewPlaceholder}>
                        <ImageIcon size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>

                  {expandedValue === room.name && (
                    <View style={styles.galleryContainer}>
                      <ImageGallery
                        images={imagePerRoom || []}
                        // onRefresh={refreshData}
                        room={room}
                        selectable={isSelectionMode}
                        onSelectionChange={handleSelectionChange}
                        initialSelectedKeys={selectedPhotos.map((p) => p.id)}
                        refetch={refetch}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {(rooms?.length || 0) > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            onPress={() => router.push("../camera")}
            // onPress={handleTakePhoto}
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

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedRoomFilter={selectedRoomFilter}
        setSelectedRoomFilter={setSelectedRoomFilter}
        selectedTagFilters={selectedTagFilters}
        setSelectedTagFilters={setSelectedTagFilters}
        rooms={rooms || []}
        tags={tags || []}
        photos={images?.data || []}
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
                <Building2 size={24} color="#182e43" />
                <Text style={styles.modalTitle}>Select Room</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowRoomSelection(false);
                  setSelectedRoom(null);
                }}
              >
                <XCircle size={24} color="#64748b" />
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
                <Home size={24} color="#182e43" />
                <Text style={styles.modalTitle}>Project Cover</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCoverModal(false)}
              >
                <XCircle size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {mainImage ? (
                <View style={styles.coverPreview}>
                  <Image
                    source={{ uri: mainImage }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                  <View style={styles.coverOverlay}>
                    <Text style={styles.coverOverlayText}>Current Cover</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Home size={48} color="#94a3b8" />
                  <Text style={styles.coverPlaceholderText}>
                    No cover image set
                  </Text>
                </View>
              )}

              <View
                // style={styles.actionButtonsContainer}
                className="flex-row gap-1"
              >
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
                      <CameraIcon size={20} color="#fff" />
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
                      <ImageIcon size={20} color="#fff" />
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

      <SaveToPhoneModal
        visible={showSaveToPhoneModal}
        onClose={() => setShowSaveToPhoneModal(false)}
        selectedPhotos={selectedPhotos}
        onComplete={handleSaveToPhoneComplete}
      />
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
  actionButtonActive: {
    backgroundColor: "#182e43",
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
    backgroundColor: "#182e43",
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
    backgroundColor: "#182e43",
    width: "auto",
    paddingHorizontal: 8,
  },
  libraryButton: {
    backgroundColor: "#182e43",
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
    backgroundColor: "#182e43",
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
    backgroundColor: "#182e43",
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
    color: "#182e43",
    fontWeight: "500",
  },
});
