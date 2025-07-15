import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/lib/imagekit";

const XIcon = X as any;

interface ClaimSummaryEditorProps {
  visible: boolean;
  onClose: () => void;
  claimSummary: string;
  claimSummaryImages: string[];
  onChangeSummary: (summary: string) => void;
  onChangeImages: (images: string[]) => void;
  projectId: string;
  asModal?: boolean; // new prop
  onTakePhoto?: () => void; // new prop
}

export const ClaimSummaryEditor: React.FC<ClaimSummaryEditorProps> = ({
  visible,
  onClose,
  claimSummary,
  claimSummaryImages,
  onChangeSummary,
  onChangeImages,
  projectId,
  asModal = true,
  onTakePhoto,
}) => {
  const [summary, setSummary] = useState(claimSummary);
  const [images, setImages] = useState<string[]>(claimSummaryImages);
  const [uploading, setUploading] = useState(false);

  // Sync local state with props
  useEffect(() => {
    setSummary(claimSummary);
  }, [claimSummary]);
  useEffect(() => {
    setImages(claimSummaryImages);
  }, [claimSummaryImages]);

  // Auto-save on change
  useEffect(() => {
    if (summary !== claimSummary) {
      onChangeSummary(summary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);
  useEffect(() => {
    if (images !== claimSummaryImages) {
      onChangeImages(images);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const pickImages = async () => {
    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets) {
        const uploadedUrls: string[] = [];
        for (const asset of result.assets) {
          const response = await uploadImage(asset, {
            folder: `projects/${projectId}/claim-summary`,
            useUniqueFileName: true,
            tags: [`project-${projectId}`, "claim-summary"],
          });
          uploadedUrls.push(response.url);
        }
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (e) {
      // handle error
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setImages((prev) => prev.filter((_, i) => i !== idx));
        },
      },
    ]);
  };

  const handleAddImage = () => {
    if (onTakePhoto) {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Take Photo(s)", "Pick from Gallery", "Cancel"],
            cancelButtonIndex: 2,
          },
          (buttonIndex) => {
            if (buttonIndex === 0) {
              onTakePhoto();
            } else if (buttonIndex === 1) {
              pickImages();
            }
          }
        );
      } else {
        // Android: simple prompt
        // For simplicity, just pick from gallery or call onTakePhoto
        // You can use a custom modal if you want
        // Here, just call pickImages for now, or implement a picker
        pickImages();
      }
    } else {
      pickImages();
    }
  };

  if (asModal) {
    if (!visible) return null;
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Card style={styles.card}>
            <CardHeader style={styles.header}>
              <CardTitle>Document Source of Loss</CardTitle>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <XIcon size={24} color="#64748b" />
              </TouchableOpacity>
            </CardHeader>
            <CardContent>
              <Text style={styles.label}>Claim Summary</Text>
              <TextInput
                value={summary}
                onChangeText={setSummary}
                placeholder="Describe the source of loss..."
                multiline
                numberOfLines={4}
                style={styles.textInput}
              />
              <Text style={[styles.label, { marginTop: 16 }]}>Images</Text>
              <ScrollView horizontal style={{ marginVertical: 8 }}>
                {images.map((url, idx) => (
                  <View key={idx} style={styles.imageWrapper}>
                    <Image source={{ uri: url }} style={styles.image} />
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(idx)}
                      style={styles.removeImageButton}
                    >
                      <XIcon size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={handleAddImage}
                  style={[styles.image, styles.addImageButton]}
                  disabled={uploading}
                >
                  <Text
                    style={{ fontSize: 32, color: uploading ? "#ccc" : "#888" }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </CardContent>
          </Card>
        </View>
      </Modal>
    );
  }

  // Inline mode (no modal, no overlay, no close button)
  return (
    <Card style={styles.card}>
      <CardHeader style={styles.header}>
        <CardTitle>Document Source of Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <Text style={styles.label}>Claim Summary</Text>
        <TextInput
          value={summary}
          onChangeText={setSummary}
          placeholder="Describe the source of loss..."
          multiline
          numberOfLines={4}
          style={styles.textInput}
        />
        <Text style={[styles.label, { marginTop: 16 }]}>Images</Text>
        <ScrollView horizontal style={{ marginVertical: 8 }}>
          {images.map((url, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri: url }} style={styles.image} />
              <TouchableOpacity
                onPress={() => handleRemoveImage(idx)}
                style={styles.removeImageButton}
              >
                <XIcon size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={handleAddImage}
            style={[styles.image, styles.addImageButton]}
            disabled={uploading}
          >
            <Text style={{ fontSize: 32, color: uploading ? "#ccc" : "#888" }}>
              +
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 0,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1d",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    textAlignVertical: "top",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ClaimSummaryEditor;
