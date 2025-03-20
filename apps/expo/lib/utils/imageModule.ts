// Enhanced Image Module with improved functionality
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { v4 } from "react-native-uuid/dist/v4";
import { supabaseServiceRole } from "@/app/projects/[projectId]/camera";
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
  if (imageKey.startsWith("http")) {
    return imageKey;
  }
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
  // In a real implementation, you might add size parameters here
  // For example: return `${baseUrl}?width=${sizeMap[size]}`;
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
 * Compresses an image using ImageManipulator
 * @param photo The image to compress
 * @param compression The compression level
 * @returns The compressed image
 */
export const compressImage = async (
  photo: ImagePicker.ImagePickerAsset,
  compression: "high" | "medium" | "low" = "medium"
): Promise<ImageManipulator.ImageResult> => {
  // Determine resize dimensions based on original image size
  const { width, height } = photo;
  let resizeDimensions: { width?: number; height?: number } = {};

  // Only resize if the image is larger than certain thresholds
  if (width && height) {
    const maxDimension = Math.max(width, height);

    // Different resize thresholds based on compression level
    const resizeThresholds = {
      high: 2048, // Preserve more quality
      medium: 1600, // Good balance
      low: 1200, // More compression
    };

    const threshold = resizeThresholds[compression];

    if (maxDimension > threshold) {
      const aspectRatio = width / height;

      if (width >= height) {
        resizeDimensions = {
          width: threshold,
          height: Math.round(threshold / aspectRatio),
        };
      } else {
        resizeDimensions = {
          width: Math.round(threshold * aspectRatio),
          height: threshold,
        };
      }
    }
  }

  // Determine quality based on compression level
  const qualityMap = {
    high: 0.9,
    medium: 0.7,
    low: 0.5,
  };

  const quality = qualityMap[compression];

  // Apply manipulations
  const manipulationActions: ImageManipulator.Action[] = [];

  // Only add resize action if dimensions were calculated
  if (resizeDimensions.width && resizeDimensions.height) {
    manipulationActions.push({
      resize: resizeDimensions,
    });
  }

  // Compress the image
  return ImageManipulator.manipulateAsync(photo.uri, manipulationActions, {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });
};

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
    onSuccess?: (file: any) => void;
    compression?: "high" | "medium" | "low";
  } = {}
): Promise<any | undefined> => {
  const {
    bucket = STORAGE_BUCKETS.PROJECT,
    pathPrefix = "",
    tableName,
    idField,
    imageKeyField = "imageKey",
    onSuccess,
    compression = "medium",
  } = options;

  try {
    // Show loading toast
    toast("Compressing and uploading image...");

    // Compress the image before uploading
    const compressedImage = await compressImage(photo, compression);
    console.log("🚀 ~ compressedImage:", compressedImage);

    const p = {
      uri: compressedImage.uri,
      name: photo.fileName || `${v4()}.jpeg`,
      type: photo.mimeType || "image/jpeg",
    };
    console.log("🚀 ~ Compressed image:", p);

    const formData = new FormData();
    // @ts-expect-error react-native form data typing issue
    formData.append("file", p);

    // Upload to Supabase storage
    const path = pathPrefix
      ? `/${pathPrefix}/${entityId}/${v4()}.jpeg`
      : `/${entityId}/${v4()}.jpeg`;

    const res = await supabaseServiceRole.storage
      .from(bucket)
      .upload(path, formData, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!res.data?.path) {
      throw new Error(`Failed to upload image to ${bucket}`);
    }

    // If a database table is specified, add a record to it
    if (tableName && idField) {
      const record: Record<string, any> = {};
      record[idField] = entityId;
      record[imageKeyField] = res.data.path;

      const { error } = await supabaseServiceRole
        .from(tableName)
        .insert(record);

      if (error) {
        console.error(
          `Failed to add image to ${tableName} table`,
          JSON.stringify(error, null, 2)
        );
        toast.error(`Failed to add image to ${tableName} table`);
        return undefined;
      }
    }

    // Call onSuccess callback if provided
    if (onSuccess) {
      await onSuccess(res.data);
    }

    toast.success("Image uploaded successfully");
    return res.data;
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Failed to upload image");
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
    onSuccess?: (file: any) => void;
    onRefresh?: () => Promise<void>;
    compression?: "high" | "medium" | "low";
  } = {}
): Promise<void> => {
  // Request camera permissions
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

  if (cameraPermission.status !== "granted") {
    toast.error("Camera permission is required to take photos");
    return;
  }

  try {
    toast("Preparing camera...");

    // Determine quality based on compression level
    const quality =
      options.compression === "high"
        ? 0.9
        : options.compression === "low"
        ? 0.5
        : 0.7;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality,
      exif: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      console.log("🚀 ~ result.assets?.[0]:", result.assets?.[0]);
      toast("Processing image...");

      const file = await uploadImageToStorage(result.assets[0], entityId, {
        ...options,
        onSuccess: async (file) => {
          console.log("🚀 ~ file:", file);
          await options.onSuccess?.(file);
        },
      });
      console.log("🚀 ~ file:", file);
      // Explicitly refresh the UI to show the new image
      if (options.onRefresh) {
        await options.onRefresh();
      }

      // if (options.onSuccess) {
      //   await options.onSuccess([file]);
      // }

      toast.success("Image uploaded successfully");
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to capture image");
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
    onSuccess?: (files: any[]) => void;
    onRefresh?: () => Promise<void>;
    compression?: "high" | "medium" | "low";
    maxImages?: number;
  } = {}
): Promise<void> => {
  try {
    // Determine quality based on compression level
    const quality =
      options.compression === "high"
        ? 0.9
        : options.compression === "low"
        ? 0.5
        : 0.7;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality,
      selectionLimit: options.maxImages || 20,
      exif: true,
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
        uploadImageToStorage(asset, entityId, {
          ...options,
          // Don't show individual success toasts for batch uploads
          onSuccess: undefined,
        })
      );

      const uploadedImages = await Promise.all(uploadPromises);

      // Always call refresh to update the UI
      if (options.onRefresh) {
        await options.onRefresh();
      }

      // Also call onSuccess if provided (for compatibility)
      if (options.onSuccess) options.onSuccess(uploadedImages);

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
    toast("Deleting image...");

    // Delete from storage
    await supabaseServiceRole.storage.from(bucket).remove([imageKey]);

    // Delete from database if table is specified
    if (tableName) {
      await supabaseServiceRole.from(tableName).delete().eq(keyField, imageKey);
    }

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

// Re-export the OptimizedImage component
export { OptimizedImage } from "./OptimizedImage";

// Export everything from imageHelpers for backward compatibility
export * from "./imageHelpers";
