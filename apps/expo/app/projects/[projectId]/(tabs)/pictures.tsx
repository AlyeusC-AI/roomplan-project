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
import * as FileSystem from "expo-file-system";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import AddRoomButton from "@/components/project/AddRoomButton";

interface PhotoResult {
  uri: string;
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
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [shouldOpenCamera, setShouldOpenCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const rooms = roomInferenceStore();
  const urlMap = urlMapStore();
  const router = useRouter();
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
      console.log("🚀 ~ refreshData ~ roomsData:", roomsData);
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
    console.log("🚀 ~ uploadToSupabase ~ imagePath:", imagePath, roomId);
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
      console.log("🚀 ~ uploadToSupabase ~ response:", data);

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
          console.log("🚀 ~ onSuccess: ~ file:", file, selectedRoom);
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
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            imageId,
            body: note,
          }),
        }
      );

      const data = await response.json();
      console.log("🚀 ~ handleAddNote ~ data:", data);
      if (data.data) {
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
        buttonText="Start Taking Pictures"
        icon={<CameraIcon height={50} width={50} />}
        secondaryIcon={
          <CameraIcon height={20} width={20} color="#fff" className="ml-4" />
        }
        onPress={() => router.push("../camera")}
      />
    );
  }
  const onDelete = async (imagePublicId: string) => {
    console.log("🚀 ~ onDelete ~ imagePublicId:", imagePublicId);
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
      console.log("🚀 ~ onDelete ~ response:", response);
      const data = await response.json();
      console.log("🚀 ~ onDelete ~ data:", data);

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
      Inference: room.Inference.filter(
        (i) =>
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
          <View style={styles.buttonContainer} className="gap-2">
            {/* <Button
              className="mr-2"
              variant="outline"
              onPress={() => router.push("../rooms/create")}
            >
              <Plus size={18} color="#1e40af" />
              <Text className="ml-1 text-primary">Add Room</Text>
            </Button> */}
            <AddRoomButton variant="outline" />
            <Button variant="outline" onPress={handlePickImages}>
              <View className="flex-row items-center">
                <ImagePlus size={18} color="#1e40af" />
                <Text className="ml-1 text-primary">Select Images</Text>
              </View>
            </Button>
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
    marginBottom: 16,
    color: "#1e293b",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
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
});
