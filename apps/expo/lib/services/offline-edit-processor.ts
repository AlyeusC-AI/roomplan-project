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
      // Group edits by readingId to handle batched updates
      const editsByReading = this.groupEditsByReading(pendingEdits);

      for (const [readingId, edits] of Object.entries(editsByReading)) {
        await this.processBatchedEdits(readingId, edits);
      }
    } catch (error) {
      console.error("Error processing edit queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private groupEditsByReading(
    edits: OfflineEditOperation[]
  ): Record<string, OfflineEditOperation[]> {
    const grouped: Record<string, OfflineEditOperation[]> = {};

    edits.forEach((edit) => {
      if (!grouped[edit.readingId]) {
        grouped[edit.readingId] = [];
      }
      grouped[edit.readingId].push(edit);
    });

    return grouped;
  }

  private async processBatchedEdits(
    readingId: string,
    edits: OfflineEditOperation[]
  ) {
    const store = useOfflineReadingsStore.getState();

    // Find the most recent update edit (if any)
    const updateEdit = edits
      .filter((edit) => edit.operation === "update")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

    // Find delete edit (if any)
    const deleteEdit = edits.find((edit) => edit.operation === "delete");

    try {
      // Process delete first if it exists
      if (deleteEdit) {
        await this.processEdit(deleteEdit);
        // Remove all other edits for this reading since it's being deleted
        edits.forEach((edit) => {
          if (edit.id !== deleteEdit.id) {
            store.removeEditFromQueue(edit.id);
          }
        });
        return;
      }

      // Process update if it exists
      if (updateEdit) {
        await this.processEdit(updateEdit);
        // Remove all other update edits for this reading since they're now merged
        edits.forEach((edit) => {
          if (edit.operation === "update" && edit.id !== updateEdit.id) {
            store.removeEditFromQueue(edit.id);
          }
        });
      }
    } catch (error) {
      console.error(
        `Error processing batched edits for reading ${readingId}:`,
        error
      );
    }
  }

  private async processEdit(edit: OfflineEditOperation) {
    const store = useOfflineReadingsStore.getState();

    try {
      // Update status to uploading
      store.updateEditStatus(edit.id, "uploading");

      if (edit.operation === "update") {
        // Update the reading using the API client with all batched data
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
