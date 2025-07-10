import {
  useOfflineGenericReadingsStore,
  OfflineGenericReading,
} from "../state/offline-generic-readings";
import { readingsService } from "@service-geek/api-client";
import { toast } from "sonner-native";

class OfflineGenericReadingsProcessor {
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  async processQueue() {
    if (this.isProcessing) return;

    const store = useOfflineGenericReadingsStore.getState();
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
      console.error("Error processing generic readings queue:", error);
    } finally {
      this.isProcessing = false;
      store.setIsProcessing(false);
    }
  }

  private async processReading(reading: OfflineGenericReading) {
    const store = useOfflineGenericReadingsStore.getState();

    try {
      // Update status to uploading
      store.updateStatus(reading.id, "uploading");

      if (reading.type === "new") {
        // Create new generic reading
        await readingsService.createGenericRoomReading({
          roomReadingId: reading.roomReadingId,
          value: reading.value,
          humidity: reading.humidity,
          temperature: reading.temperature,
          images: reading.images,
        });
        store.updateStatus(reading.id, "completed");
        toast.success(`Generic reading uploaded successfully`);

        // Auto-clear completed reading after a delay
        setTimeout(() => {
          store.clearCompleted();
        }, 2000);
      } else if (reading.type === "edit") {
        // Update existing generic reading
        await readingsService.updateGenericRoomReading(
          reading.originalReadingId!,
          {
            value: reading.value,
            humidity: reading.humidity,
            temperature: reading.temperature,
            images: reading.images,
          }
        );
        store.updateStatus(reading.id, "completed");
        toast.success(`Generic reading update uploaded successfully`);

        // Auto-clear completed reading after a delay
        setTimeout(() => {
          store.clearCompleted();
        }, 2000);
      }
    } catch (error) {
      console.error(`Error uploading generic reading ${reading.id}:`, error);
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
      const store = useOfflineGenericReadingsStore.getState();
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
    useOfflineGenericReadingsStore.getState().setIsProcessing(false);
  }
}

export const offlineGenericReadingsProcessor =
  new OfflineGenericReadingsProcessor();
