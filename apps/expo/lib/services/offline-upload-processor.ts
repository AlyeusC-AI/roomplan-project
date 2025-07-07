import {
  useOfflineUploadsStore,
  OfflineImageUpload,
} from "../state/offline-uploads";
import { roomsService } from "@service-geek/api-client";
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

      // Simulate the addImage mutation
      // In a real implementation, you would call the actual API
      const response = await this.uploadImageToServer(upload);

      if (response.success) {
        store.updateUploadStatus(upload.id, "completed");
        toast.success(`Image uploaded successfully`);
      } else {
        throw new Error(response.error || "Upload failed");
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

  private async uploadImageToServer(
    upload: OfflineImageUpload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the roomsService.addImage method from the API client
      await roomsService.addImage({
        url: upload.imageUrl,
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
