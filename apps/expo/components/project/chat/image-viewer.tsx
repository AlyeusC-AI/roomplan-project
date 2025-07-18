import React, { useState, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Download, X } from "lucide-react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const DownloadIcon = Download as any;
const XIcon = X as any;


interface ImageViewerProps {
  visible: boolean;
  image: any;
  images?: any[];
  currentIndex?: number;
  onClose: () => void;
  onDownload: (fileUrl: string, fileName: string) => void;
  downloadingFiles?: Set<string>;
}

export function ImageViewer({
  visible,
  image,
  images = [],
  currentIndex = 0,
  onClose,
  onDownload,
  downloadingFiles = new Set(),
}: ImageViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const scrollViewRef = useRef<ScrollView>(null);

  // Use images array if available, otherwise use single image
  const imageList = images.length > 0 ? images : [image];
  const currentImage = imageList[currentImageIndex] || image;

  if (!currentImage) return null;

  const isDownloading = downloadingFiles.has(
    `${currentImage.fileUrl}_${currentImage.fileName}`
  );

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setCurrentImageIndex(index);
  };

  const handleSwipe = (direction: "left" | "right") => {
    const newIndex =
      direction === "left"
        ? Math.min(currentImageIndex + 1, imageList.length - 1)
        : Math.max(currentImageIndex - 1, 0);

    setCurrentImageIndex(newIndex);
    scrollViewRef.current?.scrollTo({
      x: newIndex * screenWidth,
      animated: true,
    });
  };

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

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>
                <XIcon  />
              </Text>
            </TouchableOpacity>
             {/* Image counter for multiple images */}
             {imageList.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.counterText}>
                  {currentImageIndex + 1} / {imageList.length}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.downloadButton,
                isDownloading && styles.downloadButtonLoading,
              ]}
              onPress={() =>
                onDownload(currentImage.fileUrl, currentImage.fileName)
              }
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                <DownloadIcon />
                  {/* <Text style={styles.downloadIcon}>↓</Text> */}
                  {/* <Text style={styles.downloadText}>Download</Text> */}
                </>
              )}
            </TouchableOpacity>

           

            
          </View>

          {/* Images with horizontal scrolling */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
          >
            {imageList.map((img, index) => (
              <View key={index} style={styles.imageContainer}>
                <RNImage
                  source={{ uri: img.fileUrl }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Navigation arrows for multiple images */}
          {imageList.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.leftArrow]}
                  onPress={() => handleSwipe("right")}
                >
                  <Text style={styles.arrowIcon}>‹</Text>
                </TouchableOpacity>
              )}
              {currentImageIndex < imageList.length - 1 && (
                <TouchableOpacity
                  style={[styles.navArrow, styles.rightArrow]}
                  onPress={() => handleSwipe("left")}
                >
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {currentImage.fileName}
            </Text>
            {currentImage.fileSize ? (
              <Text style={styles.fileSize}>
                {formatFileSize(currentImage.fileSize || 200)}
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
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1,
    // borderBottomWidth: 1,
    // borderColor: "white"
  },
  downloadButton: {
    // backgroundColor: "#15438e",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  downloadButtonLoading: {
    // backgroundColor: "#1976d2",
    backgroundColor: "rgba(0, 0, 0, 0.5)",

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
  imageCounter: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  scrollView: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  scrollViewContent: {
    alignItems: "center",
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
  leftArrow: {
    left: 16,
  },
  rightArrow: {
    right: 16,
  },
  arrowIcon: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "600",
  },
});
