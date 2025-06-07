import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { toast } from "sonner-native";

/**
 * Requests camera permissions and captures an image with the device camera
 */
export const captureImageWithCamera = async (
  onImageSelected: (photo: ImagePicker.ImagePickerAsset) => void
) => {
  // Request camera permissions
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission Denied",
      "Camera permission is required to take photos"
    );
    return;
  }

  try {
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onImageSelected(result.assets[0]);
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to capture image");
  }
};

/**
 * Requests media library permissions and lets the user pick an image from the gallery
 */
export const pickImageFromGallery = async (
  onImageSelected: (photo: ImagePicker.ImagePickerAsset) => void
) => {
  // Request media library permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission Denied",
      "Media library permission is required to select photos"
    );
    return;
  }

  // Launch image library
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    onImageSelected(result.assets[0]);
  }
};

/**
 * Shows an alert dialog with options to capture a photo or pick from gallery
 */
export const showImagePickerOptions = (
  captureImage: () => void,
  pickImage: () => void
) => {
  Alert.alert(
    "Add Image",
    "Choose an option",
    [
      {
        text: "Take Photo",
        onPress: captureImage,
      },
      {
        text: "Choose from Gallery",
        onPress: pickImage,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ],
    { cancelable: true }
  );
};

/**
 * Confirm image deletion with an alert dialog
 */
export const confirmImageDeletion = (onDelete: () => void) => {
  Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Delete",
      style: "destructive",
      onPress: onDelete,
    },
  ]);
};
