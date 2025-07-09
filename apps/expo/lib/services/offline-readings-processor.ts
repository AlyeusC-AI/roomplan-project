import {
  useOfflineReadingsStore,
  OfflineRoomReading,
} from "../state/offline-readings";
import { readingsService } from "@service-geek/api-client";
import { toast } from "sonner-native";
import { offlineEditProcessor } from "./offline-edit-processor";

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

  private async processReading(reading: OfflineRoomReading) {
    const store = useOfflineReadingsStore.getState();

    try {
      // Update status to uploading
      store.updateReadingStatus(reading.id, "uploading");

      // Use the readingsService.createRoomReading method from the API client
      await readingsService.createRoomReading({
        roomId: reading.roomId,
        date: reading.date,
        humidity: reading.humidity,
        temperature: reading.temperature,
      });

      store.updateReadingStatus(reading.id, "completed");
      toast.success(`Reading uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading reading ${reading.id}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      store.updateReadingStatus(reading.id, "failed", errorMessage);

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
    // Also process edit queue
    offlineEditProcessor.startProcessing();
  }

  // Method to stop processing
  stopProcessing() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.isProcessing = false;
    useOfflineReadingsStore.getState().setIsProcessing(false);
    offlineEditProcessor.stopProcessing();
  }

  // Method to process both readings and edits
  async processAllQueues() {
    await Promise.all([
      this.processQueue(),
      offlineEditProcessor.processQueue(),
    ]);
  }
}

export const offlineReadingsProcessor = new OfflineReadingsProcessor();
