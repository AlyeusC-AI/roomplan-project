import { apiClient } from "./client";

interface SpaceUploadResponse {
  signedUrl: string;
  publicUrl: string;
  key: string;
}

export const getUploadUrl = async (
  fileName: string
): Promise<SpaceUploadResponse> => {
  try {
    const response = await apiClient.get(`/space?fileName=${fileName}`);
    return response.data;
  } catch (error) {
    console.log("🚀 ~ eraasssror:", error);
    throw error;
  }
};

export const uploadFile = async (
  file: File | Blob,
  fileName: string
): Promise<SpaceUploadResponse> => {
  // First get the signed URL
  const { signedUrl, publicUrl, key } = await getUploadUrl(fileName);
  console.log("🚀 ~ signedUrl:", signedUrl);

  // Upload the file using the signed URL
  const response = await fetch(signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to DigitalOcean Spaces");
  }

  return { signedUrl, publicUrl, key };
};
