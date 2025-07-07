import {
  useOfflineReadingsStore,
  OfflineEditOperation,
} from "../state/offline-readings";
import { readingsService } from "@service-geek/api-client";
import { toast } from "sonner-native";

class OfflineEditProcessor {
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  async processQueue() {
    if (this.isProcessing) return;

    const store = useOfflineReadingsStore.getState();
    const pendingEdits = store.getPendingEdits();

    if (pendingEdits.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      for (const edit of pendingEdits) {
        await this.processEdit(edit);
      }
    } catch (error) {
      console.error("Error processing edit queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEdit(edit: OfflineEditOperation) {
    const store = useOfflineReadingsStore.getState();

    try {
      // Update status to uploading
      store.updateEditStatus(edit.id, "uploading");

      if (edit.operation === "update") {
        // Update the reading using the API client
        await readingsService.updateRoomReading(edit.readingId, {
          date: edit.data?.date,
          humidity: edit.data?.humidity,
          temperature: edit.data?.temperature,
        });
      } else if (edit.operation === "delete") {
        // Delete the reading using the API client
        await readingsService.deleteRoomReading(edit.readingId);
      }

      store.updateEditStatus(edit.id, "completed");
      toast.success(`Reading ${edit.operation} completed`);
    } catch (error) {
      console.error(
        `Error ${edit.operation}ing reading ${edit.readingId}:`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      store.updateEditStatus(edit.id, "failed", errorMessage);

      // Auto-retry logic (max 3 retries)
      if (edit.retryCount < 3) {
        this.scheduleRetry(edit.id, Math.pow(2, edit.retryCount) * 1000); // Exponential backoff
      }
    }
  }

  private scheduleRetry(editId: string, delay: number) {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      const store = useOfflineReadingsStore.getState();
      store.retryEdit(editId);
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
  }
}

export const offlineEditProcessor = new OfflineEditProcessor();
