import {
  ImageKitAuthToken,
  ImageKitUploadOptions,
  ImageKitUploadResponse,
} from "../types/imagekit";
import { apiClient } from "./client";

export const getImageKitAuthToken = async (): Promise<ImageKitAuthToken> => {
  const response = await apiClient.get("/imageKit");
  return response.data;
};

export const uploadImage = async (
  file: File | Blob | string,
  options: ImageKitUploadOptions = {}
): Promise<ImageKitUploadResponse> => {
  const { token, expire, signature } = await getImageKitAuthToken();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("token", token);
  formData.append("expire", expire.toString());
  formData.append("signature", signature);
  formData.append("publicKey", "public_3P95CgUAWGTwOS3848WAhIWOjBs=");

  // Generate fileName based on file type
  const fileName = file instanceof File ? file.name : `image_${Date.now()}.jpg`;
  formData.append("fileName", fileName);

  if (options.folder) formData.append("folder", options.folder);
  if (options.tags) formData.append("tags", options.tags.join(","));
  if (options.useUniqueFileName) formData.append("useUniqueFileName", "true");
  if (options.responseFields)
    formData.append("responseFields", options.responseFields.join(","));
  if (options.isPrivateFile) formData.append("isPrivateFile", "true");

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload image to ImageKit");
  }

  return response.json();
};
