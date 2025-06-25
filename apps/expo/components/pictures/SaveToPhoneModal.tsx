import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import { X, Download } from "lucide-react-native";
import * as MediaLibrary from "expo-media-library";
import { toast } from "sonner-native";

// Type assertion to fix ReactNode compatibility
const XIcon = X as any;
const DownloadIcon = Download as any;

interface SaveToPhoneModalProps {
  visible: boolean;
  onClose: () => void;
  selectedPhotos: any[];
  onComplete?: () => void;
}

export default function SaveToPhoneModal({
  visible,
  onClose,
  selectedPhotos,
  onComplete,
}: SaveToPhoneModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const handleSaveToPhone = async () => {
    try {
      setIsSaving(true);
      setSavedCount(0);

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to save images to your photo library.",
          [{ text: "OK" }]
        );
        return;
      }

      // Save each image
      let successfullySaved = 0;
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        try {
          await MediaLibrary.saveToLibraryAsync(photo.url);
          successfullySaved++;
          setSavedCount(successfullySaved);
        } catch (error) {
          console.error(`Failed to save image ${i + 1}:`, error);
        }
      }

      toast.success(
        `Saved ${successfullySaved} image${successfullySaved > 1 ? "s" : ""} to phone`
      );
      onComplete?.();
      onClose();
    } catch (error) {
      console.error("Error saving images:", error);
      toast.error("Failed to save images to phone");
    } finally {
      setIsSaving(false);
      setSavedCount(0);
    }
  };

  const getTitle = () => {
    return `Save ${selectedPhotos.length} Image${selectedPhotos.length > 1 ? "s" : ""} to Phone`;
  };

  const getDescription = () => {
    return `This will save ${selectedPhotos.length} image${selectedPhotos.length > 1 ? "s" : ""} to your device's photo library.`;
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
              <DownloadIcon size={24} color="#1e88e5" />
              <Text style={styles.modalTitle}>{getTitle()}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XIcon size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>{getDescription()}</Text>

            {isSaving && (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color="#1e88e5" />
                <Text style={styles.progressText}>
                  Saving {savedCount} of {selectedPhotos.length} images...
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                isSaving && styles.confirmButtonDisabled,
              ]}
              onPress={handleSaveToPhone}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Save to Phone</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
    fontSize: 18,
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
  modalDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  progressText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1e88e5",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
