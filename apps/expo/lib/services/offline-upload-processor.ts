import {
  useOfflineUploadsStore,
  OfflineImageUpload,
} from "../state/offline-uploads";
import { roomsService } from "@service-geek/api-client";
import { uploadImage } from "@/lib/imagekit";
import { toast } from "sonner-native";

class OfflineUploadProcessor {
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  async processQueue() {
    if (this.isProcessing) return;

    const store = useOfflineUploadsStore.getState();
    const pendingUploads = store.getPendingUploads();

    if (pendingUploads.length === 0) {
      store.setIsProcessing(false);
      return;
    }

    this.isProcessing = true;
    store.setIsProcessing(true);

    try {
      for (const upload of pendingUploads) {
        await this.processUpload(upload);
      }
    } catch (error) {
      console.error("Error processing upload queue:", error);
    } finally {
      this.isProcessing = false;
      store.setIsProcessing(false);
    }
  }

  private async processUpload(upload: OfflineImageUpload) {
    const store = useOfflineUploadsStore.getState();

    try {
      // Update status to uploading
      store.updateUploadStatus(upload.id, "uploading");

      // First upload to ImageKit
      const uploadResult = await this.uploadImageToImageKit(upload);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "ImageKit upload failed");
      }

      // Then save reference to backend
      if (!uploadResult.url) {
        throw new Error("No URL returned from ImageKit upload");
      }

      const backendResult = await this.saveImageToBackend(
        upload,
        uploadResult.url
      );

      if (backendResult.success) {
        store.updateUploadStatus(upload.id, "completed");
        toast.success(`Image uploaded successfully`);
      } else {
        throw new Error(backendResult.error || "Backend save failed");
      }
    } catch (error) {
      console.error(`Error uploading image ${upload.id}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      store.updateUploadStatus(upload.id, "failed", errorMessage);

      // Auto-retry logic (max 3 retries)
      if (upload.retryCount < 3) {
        this.scheduleRetry(upload.id, Math.pow(2, upload.retryCount) * 1000); // Exponential backoff
      }
    }
  }

  private async uploadImageToImageKit(
    upload: OfflineImageUpload
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Create a mock ImagePickerAsset from the offline upload data
      const mockAsset = {
        uri: upload.imagePath,
        width: 800,
        height: 600,
        type: "image" as const,
        fileName: upload.metadata?.name || "offline-image.jpg",
        fileSize: upload.metadata?.size || 0,
      };

      // Upload to ImageKit
      const uploadResult = await uploadImage(mockAsset, {
        folder: `projects/${upload.projectId}/rooms/${upload.roomId}`,
        useUniqueFileName: true,
        tags: [
          `project-${upload.projectId}`,
          `room-${upload.roomId}`,
          "offline-upload",
        ],
      });

      return { success: true, url: uploadResult.url };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, error: errorMessage };
    }
  }

  private async saveImageToBackend(
    upload: OfflineImageUpload,
    imageUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the roomsService.addImage method from the API client
      await roomsService.addImage({
        url: imageUrl,
        roomId: upload.roomId,
        projectId: upload.projectId,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, error: errorMessage };
    }
  }

  private scheduleRetry(uploadId: string, delay: number) {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      const store = useOfflineUploadsStore.getState();
      store.retryUpload(uploadId);
      this.processQueue();
    }, delay);
  }

  // Method to start processing when app comes online
  startProcessing() {
    this.processQueue();
  }

  // Method to stop processing
  stopProcessing() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.isProcessing = false;
    useOfflineUploadsStore.getState().setIsProcessing(false);
  }
}

export const offlineUploadProcessor = new OfflineUploadProcessor();
