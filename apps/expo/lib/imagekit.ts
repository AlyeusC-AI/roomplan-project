import * as ImageManipulator from "expo-image-manipulator";
import ImageKit from "imagekit-javascript";
import { toast } from "sonner-native";
import { api } from "./api";
import { STORAGE_BUCKETS } from "./utils/imageHelpers";
import { v4 } from "uuid";
import {
  getImageKitAuthToken,
  getUploadUrl,
  uploadFile,
} from "@service-geek/api-client";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
global.Buffer = global.Buffer || Buffer;
// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// export const imagekit = new ImageKit({
//   publicKey: "public_3P95CgUAWGTwOS3848WAhIWOjBs=",
//   urlEndpoint: "https://ik.imagekit.io/wzgdjvwfm",
//   //   authenticationEndpoint: `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/imageKit`,
// });
// const s3Client = new S3Client({
//   endpoint: "https://digitaloceanspaces.com",
//   forcePathStyle: false,
//   region: "fra1",
//   credentials: {
//     accessKeyId: "key-1746353526787",
//     secretAccessKey: "tleJB61i+yShqLlh6l77DK2PZUPPtUt/NEB9bjlk0FM",
//   },
// });
// smartclinic;
export interface ImageKitUploadOptions {
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  responseFields?: string[];
  isPrivateFile?: boolean;
}

export interface ImageKitUploadResponse {
  url: string;
  fileId?: string;
  height?: number;
  width?: number;
  size?: number;
  name?: string;
  filePath?: string;
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
const getImageBlob = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};
/**
 * Uploads an image to ImageKit
 * @param file - File to upload (can be File object, Blob, or base64 string)
 * @param options - Upload options
 * @param onProgress - Callback function to track upload progress
 * @returns Promise with upload response
 */
export const uploadImage = async (
  file: ImagePicker.ImagePickerAsset,
  options: ImageKitUploadOptions = {},
  onProgress?: (progress: number) => void
): Promise<ImageKitUploadResponse> => {
  try {
    onProgress?.(0);

    // Get authentication parameters from your backend
    //   const response = await api.get(`/api/v1/imageKit`);

    // const { token, expire, signature } = response.data;
    onProgress?.(20);

    // Optimize image before upload
    // const optimizedFile = await optimizeImage(file);
    // const manipResult = await ImageManipulator.manipulateAsync(
    //   file.path || file.uri,
    //   [
    //     // {
    //     //   resize: {
    //     //     width: 1200,
    //     //     height: 1200,
    //     //   },
    //     // },
    //   ],
    //   {
    //     compress: 0.7,
    //     format: ImageManipulator.SaveFormat.JPEG,

    //     // base64: true,
    //     // base64: true,
    //   }
    // );
    // console.log("🚀 ~ manipResult:", manipResult);
    console.log("🚀 ~ returnnewPromise ~ file:", file);
    const finalFile = {
      ...file,
      uri: file.path || file.uri,
      name: file.name || file.fileName,
      type: "image/jpeg",
      // ...manipResult,
    };
    console.log("🚀 ~ finalFile:", finalFile);
    onProgress?.(40);

    // const blob = await getImageBlob(finalFile.uri);
    // console.log("these happened without error");
    // console.log(blob);

    // const params = {
    //   Bucket: "smartclinic",
    //   Key: finalFile.name || `${v4() + Date.now()}.jpeg`,
    //   Body: blob,
    //   ACL: "public-read",
    //   ContentType: "multipart/form-data",
    // };

    // const data = await s3Client.send(new PutObjectCommand(params));
    // console.log(data);

    // const imageUrl =
    //   "https://digitaloceanspaces.com/smartclinic/" + finalFile.name ||
    //   `${v4() + Date.now()}.jpeg`;
    // const fileInfo = await FileSystem.getInfoAsync(finalFile.uri);
    // Read the file content
    // const fileContent = await FileSystem.readAsStringAsync(finalFile.uri, {
    //   encoding: FileSystem.EncodingType.Base64,
    // });
    // Convert the manipulated image to a Blob
    // const response = await fetch(manipResult.uri);
    // const blob = await response.blob();
    const fileInfo = await FileSystem.getInfoAsync(finalFile.uri);
    console.log("🚀 ~ fileInfo:", fileInfo);
    if (!fileInfo.exists) {
      throw new Error("File does not exist at " + finalFile.uri);
    }

    // Read the file content
    // const fileContent = await FileSystem.readAsStringAsync(finalFile.uri, {
    //   encoding: FileSystem.EncodingType.Base64,
    // });
    const blob = await (await fetch(finalFile.uri)).blob();
    console.log("🚀 ~ blob:", blob);
    const fileName = finalFile.name || `${v4() + Date.now()}.jpeg`;

    let picture: Response | Blob = await fetch(finalFile.uri);
    picture = await picture.blob();
    const imageData = new File([picture], `${fileName}`);

    const { signedUrl, publicUrl, key } = await uploadFile(
      imageData,
      // await (await fetch(fileInfo.uri)).blob(),
      fileName
    );
    // console.log("🚀 ~ signedUrl:", signedUrl);
    // console.log("🚀 ~ publicUrl:", publicUrl);
    // console.log("🚀 ~ key:", key);
    return {
      url: publicUrl,
      fileId: key,
      height: finalFile.height,
      width: finalFile.width,
      size: finalFile.uri.length,
      name: finalFile.name,
      filePath: publicUrl,
      //   //           url: "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/" + uploadData.fullPath,
      //   //           fileId: uploadData.path,
      //   //           height: finalFile.height,
      //   //           width: finalFile.width,
      //   //           size: finalFile.uri.length,
      //   //           name: finalFile.name,
      //   //           filePath: uploadData.path,
    };

    // return new Promise(async (resolve, reject) => {
    //   const p = {
    //     uri: finalFile.uri,
    //     name:
    //       // finalFile.name ||
    //       `${v4() + Date.now()}.jpeg`,
    //     type: finalFile.type || "image/jpeg",
    //   };

    //   //       const formData = new FormData();
    //   //       // @ts-expect-error react-native form data typing issue
    //   //       formData.append("file", p);
    //   // const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
    //   //         .from(STORAGE_BUCKETS.PROJECT)
    //   //         .upload((options.folder || "uploads/")+p.name+Date.now(), formData, {
    //   //           contentType: 'image/jpeg',
    //   //           upsert: false,
    //   //         });
    //   //         console.log("🚀 ~ returnnewPromise ~ uploadData:", uploadData)
    //   //         console.log("🚀 ~ returnnewPromise ~ uploadError:", uploadError)
    //   //         if (uploadError) {
    //   //           reject(uploadError);
    //   //           return;
    //   //         }

    //   //         const result = {
    //   //           url: "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/" + uploadData.fullPath,
    //   //           fileId: uploadData.path,
    //   //           height: finalFile.height,
    //   //           width: finalFile.width,
    //   //           size: finalFile.uri.length,
    //   //           name: finalFile.name,
    //   //           filePath: uploadData.path,
    //   //         };
    //   //         resolve(result);
    //   const { token, expire, signature } = await getImageKitAuthToken();

    //   imagekit.upload(
    //     {
    //       file: finalFile,
    //       fileName: options.useUniqueFileName
    //         ? `${Date.now()}_${file.name || "image.jpg"}`
    //         : file.name || `${Date.now()}_${file.name || "image.jpg"}`,
    //       folder: options.folder || "uploads",
    //       tags: options.tags || [],
    //       responseFields: options.responseFields || ["tags"],
    //       isPrivateFile: options.isPrivateFile || false,
    //       token,
    //       expire,
    //       signature,
    //     },
    //     (err: Error | null, result: ImageKitUploadResponse | null) => {
    //       console.log("🚀 ~ returnnewPromise ~ result:", err, result);

    //       if (err) {
    //         reject(err);
    //         return;
    //       }

    //       if (!result) {
    //         reject("No result from ImageKit upload");
    //         return;
    //       }
    //       onProgress?.(100);
    //       resolve(result);
    //     }
    //   );
    // });
  } catch (error) {
    console.log("🚀 ~ error:", error?.data);
    console.error(
      "ImageKit upload error:",
      error?.response?.data?.message || error
    );
    toast.error(error?.response?.data?.message || error);
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
  return filePath;
  // return imagekit.url({
  //   path: filePath,
  //   transformation: transformations,
  //   transformationPosition: "path",
  // });
};
