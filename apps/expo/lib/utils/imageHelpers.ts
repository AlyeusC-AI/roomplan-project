import * as ImagePicker from "expo-image-picker";
import { v4 } from "react-native-uuid/dist/v4";
// import { supabaseServiceRole } from "@/app/projects/[projectId]/camera";
import { toast } from "sonner-native";

// Constants for different storage buckets
export const STORAGE_BUCKETS = {
  NOTES: "note-images",
  PROJECT: "project-images",
  PROFILE: "profile-images",
};

// URLs for different storage buckets
export const STORAGE_URLS = {
  [STORAGE_BUCKETS.NOTES]:
    "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/note-images",
  [STORAGE_BUCKETS.PROJECT]:
    "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/project-images",
  [STORAGE_BUCKETS.PROFILE]:
    "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/profile-images",
};

/**
 * Function to get a storage URL for a given image key and bucket
 */
export const getStorageUrl = (
  imageKey: string,
  bucket = STORAGE_BUCKETS.PROJECT
): string => {
  return `${STORAGE_URLS[bucket]}/${imageKey}`;
};

/**
 * Function to optimize image URLs with different sizes
 */
export const getOptimizedImageUrl = (
  imageKey: string,
  size: "small" | "medium" | "large" = "medium",
  bucket = STORAGE_BUCKETS.PROJECT
): string => {
  const baseUrl = getStorageUrl(imageKey, bucket);
  return baseUrl;
};

/**
 * Function to generate a placeholder color based on the image key
 */
export function generatePlaceholderColor(imageKey: string): string {
  if (!imageKey) return "#f0f0f0"; // Default light gray

  // Simple hash function to generate a consistent color from the image key
  let hash = 0;
  for (let i = 0; i < imageKey.length; i++) {
    hash = imageKey.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to RGB format with some pastel-ing to make it lighter
  const r = ((hash & 0xff0000) >> 16) * 0.7 + 75;
  const g = ((hash & 0x00ff00) >> 8) * 0.7 + 75;
  const b = (hash & 0x0000ff) * 0.7 + 75;

  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

/**
 * Generic function to upload an image to Supabase storage
 */
export const uploadImageToStorage = async (
  photo: ImagePicker.ImagePickerAsset,
  entityId: number | string,
  options: {
    bucket?: string;
    pathPrefix?: string;
    tableName?: string;
    idField?: string;
    imageKeyField?: string;
    onSuccess?: () => void;
  } = {}
): Promise<string | undefined> => {
  const {
    bucket = STORAGE_BUCKETS.PROJECT,
    pathPrefix = "",
    tableName,
    idField,
    imageKeyField = "imageKey",
    onSuccess,
  } = options;

  const p = {
    uri: photo.uri,
    name: photo.fileName || `${v4()}.jpeg`,
    type: photo.mimeType || "image/jpeg",
  };

  const formData = new FormData();
  if (p) {
    // @ts-expect-error react-native form data typing issue
    formData.append("file", p);
  }
  try {
    // Upload to Supabase storage
    const path = pathPrefix
      ? `/${pathPrefix}/${entityId}/${v4()}.jpeg`
      : `/${entityId}/${v4()}.jpeg`;

    // const res = await supabaseServiceRole.storage
    //   .from(bucket)
    //   .upload(path, formData, {
    //     cacheControl: "3600",
    //     upsert: false,
    //   });

    // if (!res.data?.path) {
    //   throw new Error(`Failed to upload image to ${bucket}`);
    // }

    // If a database table is specified, add a record to it
    if (tableName && idField) {
      const record: Record<string, any> = {};
      record[idField] = entityId;
      // record[imageKeyField] = res.data.path;

      // const { error } = await supabaseServiceRole
      //   .from(tableName)
      //   .insert(record);

      // if (error) {
      //   console.error(
      //     `Failed to add image to ${tableName} table`,
      //     JSON.stringify(error, null, 2)
      //   );
      //   toast.error(`Failed to add image to ${tableName} table`);
      //   return undefined;
    }

    // Call onSuccess callback if provided
    if (onSuccess) {
      await onSuccess();
    }

    // return res.data.path;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/**
 * Upload an image specifically for notes
 */
export const uploadNoteImage = async (
  photo: ImagePicker.ImagePickerAsset,
  noteId: number,
  onSuccess?: () => void
): Promise<string | undefined> => {
  return uploadImageToStorage(photo, noteId, {
    bucket: STORAGE_BUCKETS.NOTES,
    tableName: "NoteImage",
    idField: "noteId",
    imageKeyField: "imageKey",
    onSuccess,
  });
};

/**
 * Upload a project image without DB record
 */
export const uploadProjectImage = async (
  photo: ImagePicker.ImagePickerAsset,
  projectId: number | string,
  onSuccess?: () => void
): Promise<string | undefined> => {
  return uploadImageToStorage(photo, projectId, {
    bucket: STORAGE_BUCKETS.PROJECT,
    onSuccess,
  });
};

/**
 * Takes a photo using the camera and uploads it to Supabase
 */
export const takePhoto = async (
  entityId: number | string,
  options: {
    bucket?: string;
    pathPrefix?: string;
    tableName?: string;
    idField?: string;
    onSuccess?: () => void;
    onRefresh?: () => Promise<void>;
  } = {}
): Promise<void> => {
  // Request camera permissions
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

  if (cameraPermission.status !== "granted") {
    toast.error("Camera permission is required to take photos");
    return;
  }

  let isUploading = true;
  try {
    toast("Preparing camera...");
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      toast("Capturing image...");

      await uploadImageToStorage(result.assets[0], entityId, options);

      // Explicitly refresh the UI to show the new image
      if (options.onRefresh) {
        await options.onRefresh();
      }

      toast.success("Image uploaded successfully");
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to capture image");
  } finally {
    isUploading = false;
  }
};

/**
 * Picks multiple images from the gallery and uploads them to Supabase
 */
export const pickMultipleImages = async (
  entityId: number | string,
  options: {
    bucket?: string;
    pathPrefix?: string;
    tableName?: string;
    idField?: string;
    onSuccess?: () => void;
    onRefresh?: () => Promise<void>;
  } = {}
): Promise<void> => {
  let isUploading = true;
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 20, // Increased limit to 20 images
    });

    if (!result.canceled && result.assets?.length > 0) {
      const imageCount = result.assets.length;

      // Show appropriate loading message based on number of images
      if (imageCount === 1) {
        toast("Uploading image...");
      } else {
        toast(`Uploading ${imageCount} images...`);
      }

      // Process and upload each image
      const uploadPromises = result.assets.map((asset) =>
        uploadImageToStorage(asset, entityId, options)
      );

      await Promise.all(uploadPromises);

      // Always call refresh to update the UI
      if (options.onRefresh) {
        await options.onRefresh();
      }

      // Also call onSuccess if provided (for compatibility)
      if (options.onSuccess) options.onSuccess();

      // Show appropriate success message
      if (imageCount === 1) {
        toast.success("Image uploaded successfully");
      } else {
        toast.success(`${imageCount} images uploaded successfully`);
      }
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload images");
  } finally {
    isUploading = false;
  }
};

/**
 * Deletes an image from Supabase storage and optionally from a database table
 */
export const deleteImage = async (
  imageKey: string,
  options: {
    bucket?: string;
    tableName?: string;
    keyField?: string;
    onRefresh?: () => Promise<void>;
  } = {}
): Promise<void> => {
  const {
    bucket = STORAGE_BUCKETS.PROJECT,
    tableName,
    keyField = "imageKey",
    onRefresh,
  } = options;

  try {
    // // Delete from storage
    // await supabaseServiceRole.storage.from(bucket).remove([imageKey]);

    // // Delete from database if table is specified
    // if (tableName) {
    //   await supabaseServiceRole.from(tableName).delete().eq(keyField, imageKey);
    // }

    // Fetch fresh data after deletion
    if (onRefresh) {
      await onRefresh();
    }

    toast.success("Image deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete image");
  }
};

/**
 * Delete a note-specific image
 */
export const deleteNoteImage = async (
  imageKey: string,
  onRefresh?: () => Promise<void>
): Promise<void> => {
  return deleteImage(imageKey, {
    bucket: STORAGE_BUCKETS.NOTES,
    tableName: "NoteImage",
    keyField: "imageKey",
    onRefresh,
  });
};
