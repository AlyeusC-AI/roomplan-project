import * as ImageManipulator from "expo-image-manipulator";
import ImageKit from "imagekit-javascript";
import { toast } from "sonner-native";
import { api } from "./api";

export const imagekit = new ImageKit({
  publicKey: "public_3P95CgUAWGTwOS3848WAhIWOjBs=",
  urlEndpoint: "https://ik.imagekit.io/wzgdjvwfm",
  //   authenticationEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/imageKit`,
});

export interface ImageKitUploadOptions {
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  responseFields?: string[];
  isPrivateFile?: boolean;
}

export interface ImageKitUploadResponse {
  url: string;
  fileId: string;
  height: number;
  width: number;
  size: number;
  name: string;
  filePath: string;
}

export interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpg" | "png" | "webp" | "auto";
  crop?: "at_max" | "force" | "at_max_enlarge" | "at_least" | "maintain_ratio";
}

interface ExpoImageAsset {
  uri: string;
  width?: number;
  height?: number;
  type: string;
  name: string;
}

/**
 * Uploads an image to ImageKit
 * @param file - File to upload (can be File object, Blob, or base64 string)
 * @param options - Upload options
 * @param onProgress - Callback function to track upload progress
 * @returns Promise with upload response
 */
export const uploadImage = async (
  file: ExpoImageAsset,
  options: ImageKitUploadOptions = {},
  onProgress?: (progress: number) => void
): Promise<ImageKitUploadResponse> => {
  try {
    onProgress?.(0);

    // Get authentication parameters from your backend
      const response = await api.get(`/api/v1/imageKit`);

    const { token, expire, signature } = response.data;
    onProgress?.(20);

    // Optimize image before upload
    // const optimizedFile = await optimizeImage(file);
    const manipResult = await ImageManipulator.manipulateAsync(
      file.path || file.uri,
      [
        {
          resize: {
            width: 1200,
            height: 1200,
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        // base64: true,
        // base64: true,
      }
    );
    console.log("🚀 ~ manipResult:", manipResult);
    console.log("🚀 ~ returnnewPromise ~ file:", file);
    const finalFile = { ...file, ...manipResult };
    console.log("🚀 ~ finalFile:", finalFile);
    onProgress?.(40);
    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: finalFile,
          fileName: options.useUniqueFileName
            ? `${Date.now()}_${file.name || "image.jpg"}`
            : file.name,
          folder: options.folder || "uploads",
          tags: options.tags || [],
          responseFields: options.responseFields || ["tags"],
          isPrivateFile: options.isPrivateFile || false,
          token,
          expire,
          signature,
        },
        (err: Error | null, result: ImageKitUploadResponse | null) => {
          console.log("🚀 ~ returnnewPromise ~ result:", result);

          if (err) {
            reject(err);
            return;
          }

          if (!result) {
            reject("No result from ImageKit upload");
            return;
          }
          onProgress?.(100);
          resolve(result);
        }
      );
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    toast.error("Failed to upload image");
    // throw error;
  }
};

// Optimize image before upload
const optimizeImage = async (file: any): Promise<Blob> => {
  try {
    // Create a canvas to resize the image
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Calculate new dimensions while maintaining aspect ratio
    const maxWidth = 1200;
    const maxHeight = 1200;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    canvas.width = width;
    canvas.height = height;

    // Draw and compress image
    ctx?.drawImage(img, 0, 0, width, height);

    // Convert to blob with compression
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        "image/jpeg",
        0.7 // 70% quality
      );
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    // Return original file if optimization fails
    return file;
  }
};

/**
 * Gets an optimized URL for an image
 * @param filePath - Path of the image in ImageKit
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  filePath: string,
  options: ImageKitTransformOptions = {}
): string => {
  const transformations: ImageKitTransformOptions[] = [];

  if (options.width || options.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: options.crop || "at_max",
    });
  }

  if (options.quality) {
    transformations.push({
      quality: options.quality,
    });
  }

  if (options.format) {
    transformations.push({
      format: options.format,
    });
  }

  return imagekit.url({
    path: filePath,
    transformation: transformations,
    transformationPosition: "path",
  });
};
