import React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ImageViewerProps {
  visible: boolean;
  image: any;
  onClose: () => void;
  onDownload: (fileUrl: string, fileName: string) => void;
  downloadingFiles?: Set<string>;
}

export function ImageViewer({
  visible,
  image,
  onClose,
  onDownload,
  downloadingFiles = new Set(),
}: ImageViewerProps) {
  console.log("🚀 ~ imagesssssss:", image);

  if (!image) return null;

  const isDownloading = downloadingFiles.has(
    `${image.fileUrl}_${image.fileName}`
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.downloadButton,
                isDownloading && styles.downloadButtonLoading,
              ]}
              onPress={() => onDownload(image.fileUrl, image.fileName)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.downloadIcon}>↓</Text>
                  <Text style={styles.downloadText}>Download</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Image */}
          <RNImage
            source={{ uri: image.fileUrl }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {image.fileName}
            </Text>
            {image.fileSize ? (
              <Text style={styles.fileSize}>
                {formatFileSize(image.fileSize || 200)}
              </Text>
            ) : (
              <Text style={styles.fileSize}>Unknown file size</Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  downloadButton: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  downloadButtonLoading: {
    backgroundColor: "#1976d2",
  },
  downloadIcon: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  downloadText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  fileName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  fileSize: {
    color: "#d1d5db",
    fontSize: 12,
  },
});
