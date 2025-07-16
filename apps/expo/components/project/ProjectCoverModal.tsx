import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Home, XCircle, Camera, Image as ImageIcon } from "lucide-react-native";
import { Image as ExpoImage } from "expo-image";
import { launchImageLibraryAsync } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import { toast } from "sonner-native";
import { uploadImage } from "@/lib/imagekit";
import { useGetProjectById, useUpdateProject } from "@service-geek/api-client";

// Type assertions for Lucide icons
const HomeComponent = Home as any;
const XCircleComponent = XCircle as any;
const CameraIconComponent = Camera as any;
const ImageIconComponent = ImageIcon as any;
const ExpoImageComponent = ExpoImage as any;

interface ProjectCoverModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectCoverModal: React.FC<ProjectCoverModalProps> = ({
  visible,
  onClose,
  projectId,
}) => {
  const { data: project } = useGetProjectById(projectId);
  const [isUploading, setIsUploading] = useState(false);
  const [localMainImage, setLocalMainImage] = useState(
    project?.data?.mainImage
  );
  const updateProject = useUpdateProject();

  useEffect(() => {
    setLocalMainImage(project?.data?.mainImage);
  }, [project?.data?.mainImage]);

  const handleSetMainImage = async (useCamera: boolean = false) => {
    try {
      setIsUploading(true);
      let result;
      if (useCamera) {
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
          await updateProject.mutateAsync({
            id: projectId,
            data: { mainImage: uploadResult.url },
          });
          setLocalMainImage(uploadResult.url);
          toast.success("Cover image updated successfully");
        }
      }
    } catch (error) {
      console.error("Error setting main image:", error);
      toast.error("Failed to set cover image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <HomeComponent size={24} color="#2563eb" />
              <Text style={styles.modalTitle}>Project Cover</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XCircleComponent size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {localMainImage ? (
              <View style={styles.coverPreview}>
                <ExpoImageComponent
                  source={{ uri: localMainImage }}
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

            <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cameraButton]}
                onPress={() => handleSetMainImage(true)}
                disabled={isUploading}
              >
                {isUploading ? (
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
                disabled={isUploading}
              >
                {isUploading ? (
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
  );
};

const styles = StyleSheet.create({
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginRight: 4,
  },
  cameraButton: {},
  libraryButton: {},
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
});

export default ProjectCoverModal;
