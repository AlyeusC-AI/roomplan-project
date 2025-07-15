import {
  useOfflineReadingsStore,
  OfflineReading,
} from "../state/offline-readings";
import { readingsService } from "@service-geek/api-client";
import { toast } from "sonner-native";

class OfflineReadingsProcessor {
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  async processQueue() {
    if (this.isProcessing) return;

    const store = useOfflineReadingsStore.getState();
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
      console.error("Error processing readings queue:", error);
    } finally {
      this.isProcessing = false;
      store.setIsProcessing(false);
    }
  }

  private async processReading(reading: OfflineReading) {
    const store = useOfflineReadingsStore.getState();

    try {
      // Update status to uploading
      store.updateStatus(reading.id, "uploading");

      if (reading.type === "new") {
        // Create new reading
        await readingsService.createRoomReading({
          roomId: reading.roomId,
          date: reading.date,
          humidity: reading.humidity,
          temperature: reading.temperature,
        });
        store.updateStatus(reading.id, "completed");
        toast.success(`New reading uploaded successfully`);

        // Auto-clear completed reading after a delay
        setTimeout(() => {
          store.clearCompleted();
        }, 2000);
      } else if (reading.type === "edit") {
        // Update existing reading
        await readingsService.updateRoomReading(reading.originalReadingId!, {
          date: reading.date,
          humidity: reading.humidity,
          temperature: reading.temperature,
        });
        store.updateStatus(reading.id, "completed");
        toast.success(`Reading update uploaded successfully`);

        // Auto-clear completed reading after a delay
        setTimeout(() => {
          store.clearCompleted();
        }, 2000);
      }
    } catch (error) {
      console.error(`Error uploading reading ${reading.id}:`, error);
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
      const store = useOfflineReadingsStore.getState();
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
    useOfflineReadingsStore.getState().setIsProcessing(false);
  }
}

export const offlineReadingsProcessor = new OfflineReadingsProcessor();
