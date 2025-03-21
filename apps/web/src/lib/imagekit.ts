import ImageKit from "imagekit-javascript";

// Initialize ImageKit instance
const imagekit = new ImageKit({
  publicKey: "public_3P95CgUAWGTwOS3848WAhIWOjBs=",
  urlEndpoint: "https://ik.imagekit.io/wzgdjvwfm",
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

/**
 * Uploads an image to ImageKit
 * @param file - File to upload (can be File object, Blob, or base64 string)
 * @param options - Upload options
 * @returns Promise with upload response
 */
export const uploadImage = async (
  file: File | Blob | string,
  options: ImageKitUploadOptions = {}
): Promise<ImageKitUploadResponse> => {
  try {
    // Get authentication parameters from your backend
    const response = await fetch("/api/v1/imageKit");
    const { token, expire, signature } = await response.json();

    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file,
          fileName: options.useUniqueFileName
            ? `${Date.now()}_${file instanceof File ? file.name : "image"}`
            : file instanceof File
            ? file.name
            : `${Date.now()}_image`,
          folder: options.folder || "uploads",
          tags: options.tags || [],
          responseFields: options.responseFields || ["tags"],
          isPrivateFile: options.isPrivateFile || false,
          token,
          expire,
          signature,
        },
        (err: Error | null, result: ImageKitUploadResponse | null) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result) {
            reject(new Error("No result from ImageKit upload"));
            return;
          }
          resolve(result);
        }
      );
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw error;
  }
};

/**
 * Optimizes an image before upload
 * @param file - File to optimize
 * @returns Promise with optimized blob
 */
export const optimizeImage = async (file: File | Blob): Promise<Blob> => {
  try {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

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
    ctx.drawImage(img, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/jpeg",
        0.7
      );
    });
  } catch (error) {
    console.error("Image optimization error:", error);
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