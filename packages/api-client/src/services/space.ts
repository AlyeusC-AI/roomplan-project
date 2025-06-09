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
  try {
    // First get the signed URL
    const { signedUrl, publicUrl, key } = await getUploadUrl(fileName);
    console.log("🚀 ~ signedUrl:", signedUrl);

    // Ensure we have a proper Blob
    let uploadBlob: Blob;
    if (typeof file === "string") {
      // If it's a base64 string, convert to blob
      const response = await fetch(file);
      uploadBlob = await response.blob();
    } else if (file instanceof File) {
      uploadBlob = file;
    } else {
      uploadBlob = file;
    }

    // Create a new blob with the correct type
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
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

    const finalBlob = new Blob([uploadBlob], { type: contentType });

    // Upload the file using the signed URL
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: finalBlob,
      headers: {
        "Content-Type": contentType,
        "Content-Length": finalBlob.size.toString(),
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
        blobSize: finalBlob.size,
        originalBlobSize: uploadBlob.size,
      });
      throw new Error(
        `Failed to upload file to DigitalOcean Spaces: ${response.statusText} - ${errorText}`
      );
    }

    return { signedUrl, publicUrl, key };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
