import { v4 } from "react-native-uuid/dist/v4";
import { supabaseServiceRole } from "@/unused/screens/CameraScreen";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { toast } from "sonner-native";

type RoomReadingImage = {
  imageKey: string;
  type?: string;
};

/**
 * Requests camera permissions and captures an image with the device camera
 */
export const captureImageWithCamera = async (
  onImageSelected: (photo: ImagePicker.ImagePickerAsset) => void
) => {
  // Request camera permissions
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Camera permission is required to take photos');
    return;
  }
  
  try {
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
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
  
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Media library permission is required to select photos');
    return;
  }

  // Launch image library
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
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
 * Process and upload an image to Supabase storage
 */
export const processAndUploadImage = async (
  photo: ImagePicker.ImagePickerAsset,
  reading: ReadingsWithGenericReadings,
  type: 'room' | 'generic',
  genericReadingId?: number,
  roomType?: "floor" | "wall" | string,
  onSuccess?: () => void
) => {
  const p = {
    uri: photo.uri,
    name: photo.fileName || `${v4()}.jpeg`,
  };
  
  const formData = new FormData();
  // @ts-expect-error react-native form data typing issue
  formData.append("file", p);

  try {
    const imageKey = type === 'room' 
      ? `/${reading.publicId}/${v4()}.jpeg`
      : `/${reading.publicId}/${genericReadingId}/${v4()}.jpeg`;

    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
      .from("readings-images")
      .upload(imageKey, formData, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Update the database with the image key using Supabase
    if (type === 'room') {
      const { error: roomImageError } = await supabaseServiceRole
        .from('RoomReadingImage')
        .insert({
          RoomReadingId: reading.id,
          imageKey: uploadData.path,
          type: roomType
        });

      if (roomImageError) {
        throw roomImageError;
      }
    } else {
      const { error: genericImageError } = await supabaseServiceRole
        .from('GenericRoomReadingImage')
        .insert({
          GenericRoomReadingId: (genericReadingId),
          imageKey: uploadData.path
        });

      if (genericImageError) {
        throw genericImageError;
      }
    }

    toast.success("Image uploaded successfully");
    if (onSuccess) onSuccess();
    
    return uploadData.path;
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload image");
    return null;
  }
};

/**
 * Delete an image from Supabase storage and database
 */
export const deleteImage = async (
  imageKey: string, 
  type: 'wall' | 'floor' | 'generic' | string,
  onSuccess?: () => void
) => {
  try {
    // Delete from storage
    await supabaseServiceRole.storage
      .from("readings-images")
      .remove([imageKey]);

    // Delete from database
    if (type === 'generic') {
      await supabaseServiceRole
        .from("GenericRoomReadingImage")
        .delete()
        .eq("imageKey", imageKey);
    } else {
      await supabaseServiceRole
        .from("RoomReadingImage")
        .delete()
        .eq("imageKey", imageKey);
    }

    toast.success("Image deleted successfully");
    if (onSuccess) onSuccess();
    
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete image");
    return false;
  }
};

/**
 * Creates signed URLs for a list of image keys
 */
export const getSignedImageUrls = async (imageKeys: string[]) => {
  try {
    const { data: urlData } = await supabaseServiceRole.storage
      .from("readings-images")
      .createSignedUrls(imageKeys, 3600);

    return urlData?.reduce((acc, curr) => {
      if (curr.path && curr.signedUrl) {
        acc[curr.path] = curr.signedUrl;
      }
      return acc;
    }, {} as { [key: string]: string }) || {};
  } catch (error) {
    console.error("Failed to get signed image URLs:", error);
    return {};
  }
};

/**
 * Confirm image deletion with an alert dialog
 */
export const confirmImageDeletion = (
  imageKey: string, 
  type: 'wall' | 'floor' | 'generic' | string, 
  onDelete: () => void
) => {
  Alert.alert(
    "Delete Image",
    "Are you sure you want to delete this image?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete
      }
    ]
  );
};

/**
 * Helper function to get images for a specific extended wall
 */
export const getExtendedWallImages = (
  wallId: string | null, 
  roomReadingImages?: RoomReadingImage[]
): RoomReadingImage[] => {
  if (!wallId || !roomReadingImages) return [];
  return roomReadingImages.filter(img => img.type === wallId);
}; 