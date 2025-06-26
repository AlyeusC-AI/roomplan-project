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

const base64ToBlob = (base64: string, contentType: string): Blob => {
  const base64Data = base64.split(",")[1];
  if (!base64Data) {
    throw new Error("Invalid base64 string format");
  }
  const byteString = atob(base64Data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: contentType });
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

  // Convert base64 to Blob if the input is a string
  const fileToUpload =
    typeof file === "string" ? base64ToBlob(file, contentType) : file;

  // Upload the file using the signed URL
  const response = await fetch(signedUrl, {
    method: "PUT",
    body: fileToUpload,
    headers: {
      "Content-Type": contentType,
      "x-amz-acl": "public-read",
      "Cache-Control": "public, max-age=31536000",
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

// Export the service object for consistency with other services
export const spaceService = {
  getUploadUrl,
  uploadFile,
};
