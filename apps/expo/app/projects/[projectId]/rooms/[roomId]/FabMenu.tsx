import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  Plus,
  Camera,
  ImagePlus,
  FileText as FileTextIcon,
  BookOpen as BookOpenIcon,
} from "lucide-react-native";
import { useOfflineCreateNote } from "@/lib/hooks/useOfflineNotes";
import { useOfflineCreateRoomReading } from "@/lib/hooks/useOfflineReadings";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { toast } from "sonner-native";
import {
  takePhoto,
  pickMultipleImages,
  STORAGE_BUCKETS,
} from "@/lib/utils/imageModule";
import { useOfflineUploadsStore } from "@/lib/state/offline-uploads";
import { useAddImage } from "@service-geek/api-client";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

const PlusIcon = Plus as any;
const CameraIcon = Camera as any;
const ImagePlusIcon = ImagePlus as any;
const FileTextActionIcon = FileTextIcon as any;
const BookOpenActionIcon = BookOpenIcon as any;

interface FabMenuProps {
  roomId: string;
  projectId: string;
  noNote?: boolean;
  noReading?: boolean;
  onTakePhoto?: () => void;
}

const FabMenu: React.FC<FabMenuProps> = ({
  roomId,
  projectId,
  noNote,
  noReading,
  onTakePhoto,
}) => {
  // FAB state
  const [showFabOptions, setShowFabOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingReading, setIsCreatingReading] = useState(false);

  // Hooks for actions
  const { mutate: createNote } = useOfflineCreateNote();
  const { mutate: createRoomReading } = useOfflineCreateRoomReading(projectId);
  const { mutate: addImage } = useAddImage();
  const { isOffline } = useNetworkStatus();
  const { addToQueue } = useOfflineUploadsStore();

  // Action handlers
  const handleAddNote = async () => {
    try {
      setIsCreatingNote(true);
      await createNote({
        body: "",
        roomId: roomId,
        projectId: projectId,
      });
      toast.success("Note added successfully");
      setShowFabOptions(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create note");
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleAddReading = async () => {
    try {
      setIsCreatingReading(true);
      createRoomReading({
        roomId: roomId,
        date: new Date(),
        humidity: 0,
        temperature: 0,
      });
      toast.success("Reading added successfully");
      setShowFabOptions(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create reading");
    } finally {
      setIsCreatingReading(false);
    }
  };

  const uploadToSupabase = async (imagePath: string) => {
    if (isOffline) {
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
      return true;
    } catch (error) {
      console.error("Upload error:", error);
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
      if (onTakePhoto) {
        onTakePhoto();
      } else {
        takePhoto(roomId, {
          bucket: STORAGE_BUCKETS.PROJECT,
          pathPrefix: `projects/${projectId}/rooms`,
        });
      }
      setShowFabOptions(false);
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Failed to take photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickImages = async () => {
    try {
      setIsUploading(true);
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
            if (!isOffline && file.url && file.url !== file.path) {
              await uploadToSupabase(file.url);
            }
          }
        },
      });
      setShowFabOptions(false);
    } catch (error) {
      console.error("Error picking images:", error);
      toast.error("Failed to pick images");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.fabContainer}>
      {/* FAB Options Modal */}
      <Modal
        visible={showFabOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFabOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFabOptions(false)}
        >
          <View style={styles.fabOptionsContainer}>
            {/* Take Photo Option */}
            <TouchableOpacity
              style={styles.fabOption}
              onPress={handleTakePhoto}
              disabled={isUploading}
            >
              <View style={[styles.fabOptionIcon, styles.cameraIcon]}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <CameraIcon size={20} color="#fff" />
                )}
              </View>
              <Text style={styles.fabOptionText}>Take Photo</Text>
            </TouchableOpacity>

            {/* Upload Images Option */}
            <TouchableOpacity
              style={styles.fabOption}
              onPress={handlePickImages}
              disabled={isUploading}
            >
              <View style={[styles.fabOptionIcon, styles.uploadIcon]}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ImagePlusIcon size={20} color="#fff" />
                )}
              </View>
              <Text style={styles.fabOptionText}>Upload Images</Text>
            </TouchableOpacity>

            {/* Add Note Option */}
            {!noNote && (
              <TouchableOpacity
                style={styles.fabOption}
                onPress={handleAddNote}
                disabled={isCreatingNote}
              >
                <View style={[styles.fabOptionIcon, styles.noteIcon]}>
                  {isCreatingNote ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <FileTextActionIcon size={20} color="#fff" />
                  )}
                </View>
                <Text style={styles.fabOptionText}>Add Note</Text>
              </TouchableOpacity>
            )}

            {/* Add Reading Option */}
            {!noReading && (
              <TouchableOpacity
                style={styles.fabOption}
                onPress={handleAddReading}
                disabled={isCreatingReading}
              >
                <View style={[styles.fabOptionIcon, styles.readingIcon]}>
                  {isCreatingReading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <BookOpenActionIcon size={20} color="#fff" />
                  )}
                </View>
                <Text style={styles.fabOptionText}>Add Reading</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main FAB Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          (isUploading || isCreatingNote || isCreatingReading) &&
            styles.fabDisabled,
        ]}
        onPress={() => setShowFabOptions(!showFabOptions)}
        disabled={isUploading || isCreatingNote || isCreatingReading}
      >
        {isUploading || isCreatingNote || isCreatingReading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <PlusIcon size={30} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 100,
    paddingRight: 20,
  },
  fabOptionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  fabOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  fabOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cameraIcon: {
    backgroundColor: "#10b981",
  },
  uploadIcon: {
    backgroundColor: Colors.light.primary,
  },
  noteIcon: {
    backgroundColor: "#f59e0b",
  },
  readingIcon: {
    backgroundColor: "#8b5cf6",
  },
  fabOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
});

export default FabMenu;
