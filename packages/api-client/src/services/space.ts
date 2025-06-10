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
    screen;
  }
};

export const uploadFile = async (
  file: File | Blob | string,
  fileName: string
): Promise<SpaceUploadResponse> => {
  console.log("🚀 ~ file:", file);
  // First get the signed URL
  const { signedUrl, publicUrl, key } = await getUploadUrl(fileName);
  console.log("🚀 ~ signedUrl:", signedUrl);
  console.log("🚀 ~ publicUrl:", publicUrl);

  // Determine the correct content type
  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  console.log("🚀 ~ fileExtension:", fileExtension);
  const contentType =
    fileExtension === "jpg" || fileExtension === "jpeg"
      ? "image/jpeg"
      : fileExtension === "png"
        ? "image/png"
        : fileExtension === "gif"
          ? "image/gif"
          : fileExtension === "webp"
            ? "image/webp"
            : "application/octet-stream";

  // Upload the file using the signed URL
  const response = await fetch(signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload failed:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      contentType,
      fileName,
      headers: Object.fromEntries(response.headers.entries()),
      fileSize: file instanceof Blob ? file.size : 0,
      fileType: file instanceof Blob ? file.type : contentType,
    });
    throw new Error(
      `Failed to upload file to DigitalOcean Spaces: ${response.statusText} - ${errorText}`
    );
  }

  return { signedUrl, publicUrl, key };
};
