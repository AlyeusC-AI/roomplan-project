import * as ImageManipulator from "expo-image-manipulator";
import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: "public_3P95CgUAWGTwOS3848WAhIWOjBs=",
  urlEndpoint: "https://ik.imagekit.io/wzgdjvwfm",
  //   authenticationEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/imageKit`,
});

interface UploadResponse {
  url: string;
  fileId: string;
  height: number;
  width: number;
  size: number;
  name: string;
  filePath: string;
}

export const uploadImage = async (
  file: any,
  options: {
    folder?: string;
    tags?: string[];
    useUniqueFileName?: boolean;
    responseFields?: string[];
    isPrivateFile?: boolean;
  } = {}
): Promise<UploadResponse> => {
  try {
    // Get authentication token from your backend
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/imageKit`
    );

    const { token, expire, signature } = await response.json();

    console.log("🚀 ~ token:", token);
    // Optimize image before upload
    // const optimizedFile = await optimizeImage(file);
    const manipResult = await ImageManipulator.manipulateAsync(file.path, [], {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    console.log("🚀 ~ manipResult:", manipResult);
    console.log("🚀 ~ returnnewPromise ~ file:", file);

    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: manipResult.base64 as string,
          fileName: options.useUniqueFileName
            ? `${Date.now()}_${file.name || "image.jpg"}`
            : file.name,
          folder:
               options.folder ||
            "uploads",
          tags: options.tags || [],
          responseFields: options.responseFields || ["tags"],
          isPrivateFile: options.isPrivateFile || false,
          token,
          expire,
          signature,
        },
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result as UploadResponse);
        }
      );
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw error;
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

// Get optimized URL for an image
export const getOptimizedImageUrl = (
  filePath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string => {
  const transformations = [];

  if (options.width || options.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: "at_max",
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
