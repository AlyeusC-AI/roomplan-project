import React, { useEffect, useState } from "react";
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
import { userStore } from "@/lib/state/user";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import Empty from "@/components/project/empty";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Text } from "@/components/ui/text";
import { urlMapStore } from "@/lib/state/url-map";
import { roomInferenceStore } from "@/lib/state/readings-image";
import { Button } from "@/components/ui/button";
import ImageGallery from "@/components/project/ImageGallery";
import {
  takePhoto,
  pickMultipleImages,
  STORAGE_BUCKETS,
  getStorageUrl,
} from "@/lib/utils/imageModule";
import safelyGetImageUrl from "@/utils/safelyGetImageKey";

import AddRoomButton from "@/components/project/AddRoomButton";
import { projectStore } from "@/lib/state/project";
import { uploadImage } from "@/lib/imagekit";
import { launchImageLibraryAsync } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { api } from "@/lib/api";

interface PhotoResult {
  uri: string;
}

interface Inference {
  isDeleted?: boolean;
  Image?: {
    isDeleted?: boolean;
    publicId?: string;
    includeInReport?: boolean;
  };
  imageKey?: string;
  publicId?: string;
}

interface Room {
  id: number;
  name: string;
  isDeleted?: boolean;
  Inference: Inference[];
}

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProjectPhotos() {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const { session: supabaseSession } = userStore((state) => state);
  const [loading, setLoading] = useState(true);
  const [expandedValue, setExpandedValue] = useState<string | undefined>(
    undefined
  );
  const { project } = projectStore();
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [shouldOpenCamera, setShouldOpenCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const rooms = roomInferenceStore();
  const urlMap = urlMapStore();
  const router = useRouter();
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(false);

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
    refreshData();
  }, []);

  useEffect(() => {
    if (project?.mainImage) {
      setMainImage(project.mainImage);
    }
  }, [project]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch rooms
      const roomsRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
        }
      );

      const roomsData = await roomsRes.json();
      rooms.setRooms(roomsData.rooms);

      // Fetch images
      const imagesRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/images`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
        }
      );
      const imagesData = await imagesRes.json();
      urlMap.setUrlMap(imagesData.urlMap);

      // Set the first room as expanded by default if none is selected
      // if (!expandedValue && roomsData.rooms.length > 0) {
      //   setExpandedValue(roomsData.rooms[0].name);
      // }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const uploadToSupabase = async (imagePath: string, roomId: number) => {
    try {
      // const fileInfo = await FileSystem.getInfoAsync(fileUri);
      // if (!fileInfo.exists) {
      //   throw new Error('File does not exist');
      // }

      // const fileName = `${uuidv4()}_${fileInfo.uri.split('/').pop()}`;
      // const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });

      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from(STORAGE_BUCKETS.PROJECT)
      //   .upload(`projects/${projectId}/rooms/${fileName}`, Buffer.from(fileContent, 'base64'), {
      //     contentType: 'image/jpeg',
      //     upsert: false,
      //   });

      // if (uploadError) throw uploadError;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            // imageId: uploadData?.path,
            imageId: imagePath,
            roomId: rooms.rooms.find((r) => r.id === roomId)?.publicId,
            roomName: rooms.rooms.find((r) => r.id === roomId)?.name || "",
          }),
        }
      );

      const data = await response.json();

      if (data.status !== "ok") {
        throw new Error("Failed to process image");
      }

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
          await refreshData();
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
            await uploadToSupabase(file.path, selectedRoom);
          }
          await refreshData();
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

  // Get a preview image for a room
  const getRoomPreviewImage = (
    roomInferences: Array<{ imageKey: string | null }> | undefined
  ): string | null => {
    if (!roomInferences || roomInferences.length === 0) return null;

    for (const inference of roomInferences) {
      if (inference.imageKey) {
        const imageUrl = safelyGetImageUrl(
          urlMap.urlMap,
          inference.imageKey,
          ""
        );
        if (imageUrl) return imageUrl;
      }
    }

    // If no valid image URL was found, try to get any image key and construct a URL
    for (const inference of roomInferences) {
      if (inference.imageKey) {
        // Try to construct a URL directly using the storage URL
        const directUrl = getStorageUrl(inference.imageKey);
        if (directUrl) return directUrl;
      }
    }

    return null;
  };

  const handleAddNote = async (imageId: number, note: string) => {
    try {
      const response = await api.post(`/api/v1/projects/${projectId}/images`, {
        imageId,
        body: note,
      });
      console.log("🚀 ~ handleAddNote ~ response:", response.data);

      const data = response.data;
      if (data) {
        toast.success("Note added successfully");
        await refreshData();
      } else {
        throw new Error("Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleToggleIncludeInReport = async (
    publicId: string,
    includeInReport: boolean
  ) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/images`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            id: publicId,
            includeInReport,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update image");
      }

      toast.success("Image updated successfully");
      await refreshData();
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
      throw error; // Re-throw to be handled by the ImageGallery component
    }
  };

  const includeAllInReport = async () => {
    try {
      setIsUpdatingAll(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/images`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            ids: rooms.rooms.flatMap((room) =>
              room.Inference.filter(
                (i: Inference) => !i.isDeleted && !i.Image?.isDeleted
              ).map((i: Inference) => i.Image?.publicId || i.publicId)
            ),
            includeInReport: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update images");
      }

      toast.success("All images included in report");
      await refreshData();
    } catch (error) {
      console.error("Error updating images:", error);
      toast.error("Failed to update images");
    } finally {
      setIsUpdatingAll(false);
    }
  };

  // Add function to check if all images are included in report
  const areAllImagesIncluded = () => {
    if (!rooms.rooms?.length) return false;

    return rooms.rooms.every((room) =>
      room.Inference?.every(
        (inference: Inference) =>
          !inference.isDeleted &&
          !inference.Image?.isDeleted &&
          inference.Image?.includeInReport
      )
    );
  };

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
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "auth-token": supabaseSession?.access_token || "",
              },
              body: JSON.stringify({
                mainImage: uploadResult.url,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update project main image");
          }

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

  if (loading && !rooms?.rooms?.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!loading && !rooms?.rooms?.length) {
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
            params: { projectName: project.name },
          })
        }
      />
    );
  }
  const onDelete = async (imagePublicId: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/images`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({ photoIds: [imagePublicId] }),
        }
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error("Failed to delete images");
      }

      toast.success("Images deleted successfully");
      await refreshData();
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    } finally {
      // setIsDeleting(false);
      // setSelectedPhotos([]);
    }
  };
  const finalRooms = rooms?.rooms?.map((room) => {
    return {
      ...room,
      Inference: room.Inference?.filter(
        (i: Inference) =>
          !i.isDeleted &&
          !i.Image?.isDeleted &&
          i.Image &&
          i.imageKey !== "undefined"
      ),
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Project Photos</Text>
          <View className="flex-row gap-2 justify-between">
            <TouchableOpacity
              style={[
                styles.actionButton,
                isUploadingMainImage && styles.actionButtonDisabled,
              ]}
              onPress={() => setShowCoverModal(true)}
              disabled={isUploadingMainImage}
              className="ml-2"
            >
              {isUploadingMainImage ? (
                <View style={styles.iconContainer}>
                  <Loader size={20} color="#1e40af" />
                </View>
              ) : (
                <View style={styles.iconContainer}>
                  <Home size={20} color="#1e40af" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isUpdatingAll && styles.actionButtonDisabled,
                ]}
                onPress={includeAllInReport}
                disabled={isUpdatingAll || !rooms.rooms.length}
              >
                {isUpdatingAll ? (
                  <View style={styles.iconContainer}>
                    <Loader size={20} color="#1e40af" />
                  </View>
                ) : (
                  <View style={styles.iconContainer}>
                    <Star
                      size={20}
                      color={areAllImagesIncluded() ? "#FBBF24" : "#1e40af"}
                      fill={areAllImagesIncluded() ? "#FBBF24" : "transparent"}
                    />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePickImages}
              >
                <View style={styles.iconContainer}>
                  <ImagePlus size={20} color="#1e40af" />
                </View>
              </TouchableOpacity>
              <AddRoomButton variant="outline" />
            </View>
          </View>
        </View>

        <View style={styles.roomsContainer}>
          {finalRooms
            ?.filter((room) => !room.isDeleted)
            ?.map((room) => {
              const previewImageUrl = getRoomPreviewImage(room.Inference);
              const imageCount = room.Inference?.length || 0;

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
                        inferences={room.Inference || []}
                        urlMap={urlMap.urlMap}
                        onRefresh={refreshData}
                        roomName={room.name}
                        onDelete={onDelete}
                        onAddNote={handleAddNote}
                        onToggleIncludeInReport={handleToggleIncludeInReport}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>

      {rooms.rooms.length > 0 && (
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
              <Building2 size={24} color="#1e40af" />
              <Text style={styles.modalTitle}>Select Room</Text>
            </View>
            <Text style={styles.modalDescription}>
              Choose a room to upload images to
            </Text>

            <View style={styles.roomList}>
              {rooms.rooms
                .filter((room) => !room.isDeleted)
                .map((room) => (
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

            <View style={styles.modalFooter}>
              <Button
                variant="outline"
                onPress={() => {
                  setShowRoomSelection(false);
                  setSelectedRoom(null);
                }}
              >
                <Text>Cancel</Text>
              </Button>
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

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cameraButton]}
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
    gap: 8,
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f8fafc",
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
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
