import {
  useOfflineWallReadingsStore,
  OfflineWallReading,
} from "../state/offline-wall-readings";
import { readingsService } from "@service-geek/api-client";
import { toast } from "sonner-native";

class OfflineWallReadingsProcessor {
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  async processQueue() {
    if (this.isProcessing) return;

    const store = useOfflineWallReadingsStore.getState();
    const pendingReadings = store.getPendingReadings();

    if (pendingReadings.length === 0) {
      store.setIsProcessing(false);
      return;
    }

    this.isProcessing = true;
    store.setIsProcessing(true);

    try {
      for (const reading of pendingReadings) {
        await this.processReading(reading);
      }
    } catch (error) {
      console.error("Error processing wall readings queue:", error);
    } finally {
      this.isProcessing = false;
      store.setIsProcessing(false);
    }
  }

  private async processReading(reading: OfflineWallReading) {
    const store = useOfflineWallReadingsStore.getState();

    try {
      // Update status to uploading
      store.updateStatus(reading.id, "uploading");

      if (reading.type === "new") {
        // Create new wall reading
        await readingsService.createWallReading({
          wallId: reading.wallId,
          roomReadingId: reading.roomReadingId,
          reading: reading.reading,
          images: reading.images,
        });
        store.updateStatus(reading.id, "completed");
        toast.success(`Wall reading uploaded successfully`);

        // Auto-clear completed reading after a delay
        setTimeout(() => {
          store.clearCompleted();
        }, 2000);
      } else if (reading.type === "edit") {
        // Update existing wall reading
        await readingsService.updateWallReading(reading.originalReadingId!, {
          reading: reading.reading,
          images: reading.images,
        });
        store.updateStatus(reading.id, "completed");
        toast.success(`Wall reading update uploaded successfully`);

        // Auto-clear completed reading after a delay
        setTimeout(() => {
          store.clearCompleted();
        }, 2000);
      }
    } catch (error) {
      console.error(`Error uploading wall reading ${reading.id}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      store.updateStatus(reading.id, "failed", errorMessage);

      // Auto-retry logic (max 3 retries)
      if (reading.retryCount < 3) {
        this.scheduleRetry(reading.id, Math.pow(2, reading.retryCount) * 1000); // Exponential backoff
      }
    }
  }

  private scheduleRetry(readingId: string, delay: number) {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      const store = useOfflineWallReadingsStore.getState();
      store.retryReading(readingId);
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
    useOfflineWallReadingsStore.getState().setIsProcessing(false);
  }
}

export const offlineWallReadingsProcessor = new OfflineWallReadingsProcessor();
