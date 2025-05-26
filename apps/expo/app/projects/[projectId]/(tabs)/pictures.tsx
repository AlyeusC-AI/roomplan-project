import React, { useCallback, useEffect, useState } from "react";
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
} from "@service-geek/api-client";
import { uploadImage } from "@/lib/imagekit";

export default function ProjectPhotos() {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const [loading, setLoading] = useState(true);
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
  const { mutate: addComment } = useAddComment();

  const { data: rooms } = useGetRooms(projectId);
  const { mutate: removeImage } = useRemoveImage();
  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: bulkRemoveImages } = useBulkRemoveImages();
  const { mutate: updateImagesOrder } = useUpdateImagesOrder();
  const { mutate: updateProject } = useUpdateProject();

  const { data: images } = useSearchImages(
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

  // useFocusEffect(
  //   useCallback(() => {
  //     refreshData();
  //   }, [])
  // );
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
      const response = await bulkUpdateImages({
        projectId,
        filters: {
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
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8,
        });
      } else {
        result = await launchImageLibraryAsync({
          mediaTypes: ["images"],
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

  if (loading && !rooms?.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
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
        onPress={() =>
          router.push({
            pathname: "../rooms/create",
            params: { projectName: project?.name },
          })
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        // refreshControl={
        //   <RefreshControl refreshing={loading} onRefresh={refreshData} />
        // }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Project Photos</Text>
          <View className="flex-row gap-2 justify-between">
            <TouchableOpacity
              style={[
                {
                  width: 40,
                  height: 40,
                },
                styles.actionButton,
                isUploadingMainImage && styles.actionButtonDisabled,
              ]}
              onPress={() => setShowCoverModal(true)}
              disabled={isUploadingMainImage}
              className="ml-2 bg-accent rounded-full border border-gray-200"
            >
              {isUploadingMainImage ? (
                <View>
                  <Loader size={20} color="#1e40af" />
                </View>
              ) : (
                <View>
                  <Home size={20} color="#1e40af" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  {
                    width: 40,
                    height: 40,
                  },
                  styles.actionButton,
                  isUpdatingAll && styles.actionButtonDisabled,
                ]}
                onPress={includeAllInReport}
                disabled={isUpdatingAll || !rooms?.length}
                className="ml-2 bg-accent rounded-full border border-gray-200"
              >
                {isUpdatingAll ? (
                  <View>
                    <Loader size={20} color="#1e40af" />
                  </View>
                ) : (
                  <View>
                    <Star
                      size={20}
                      color={areAllImagesIncluded ? "#FBBF24" : "#1e40af"}
                      fill={areAllImagesIncluded ? "#FBBF24" : "transparent"}
                    />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  {
                    width: 40,
                    height: 40,
                  },
                  styles.actionButton,
                ]}
                onPress={handlePickImages}
                className="mx-2 bg-accent rounded-full border border-gray-200"
              >
                <View>
                  <ImagePlus size={20} color="#1e40af" />
                </View>
              </TouchableOpacity>
              <AddRoomButton variant="outline" />
            </View>
          </View>
        </View>

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

      {isUploading && (
        <View style={styles.uploadProgress}>
          <Text style={styles.uploadProgressText}>
            Uploading {uploadProgress} images...
          </Text>
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
                <Building2 size={24} color="#1e40af" />
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
                <Home size={24} color="#1e40af" />
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
                className="flex-row gap-2"
              >
                <TouchableOpacity
                  style={[styles.actionButton, styles.cameraButton]}
                  className="bg-accent rounded-full border border-gray-200"
                  onPress={() => handleSetMainImage(true)}
                  disabled={isUploadingMainImage}
                >
                  {isUploadingMainImage ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={styles.actionButtonContent}>
                      <CameraIcon size={24} color="#fff" />
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
                      <ImageIcon size={24} color="#fff" />
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
  headerTitle: {
    paddingTop: 8,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 2,
    justifyContent: "flex-end",
  },
  // actionButton: {
  //   // width: 44,
  //   // height: 44,
  //   borderRadius: 22,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   margin: 0,
  // },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    // backgroundColor: "#f8fafc",
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
    backgroundColor: "#1e40af",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 24,
    // width: 40,
    // height: 40,
    // borderColor: "#e2e8f0",

    // backgroundColor: "hsl(var(--destructive))",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
  },
  cameraButton: {
    backgroundColor: "#1e40af",
  },
  libraryButton: {
    backgroundColor: "#3b82f6",
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
  roomOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f1f5f9",
  },
  selectedRoom: {
    backgroundColor: "#1e40af",
  },
  roomOptionText: {
    fontSize: 16,
    color: "#1e293b",
  },
  selectedRoomText: {
    color: "#fff",
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
    backgroundColor: "#1e40af",
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
    color: "#1e40af",
    fontWeight: "500",
  },
});
