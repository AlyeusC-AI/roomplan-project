import {
  useOfflineNotesStore,
  OfflineNote,
  OfflineNoteEdit,
} from "../state/offline-notes";
import { notesService } from "@service-geek/api-client";
import { toast } from "sonner-native";
import { uploadImage } from "@/lib/imagekit";

class OfflineNotesProcessor {
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  async processQueue() {
    if (this.isProcessing) return;

    const store = useOfflineNotesStore.getState();
    const pendingNotes = store.getPendingNotes();
    const pendingEdits = store.getPendingEdits();

    if (pendingNotes.length === 0 && pendingEdits.length === 0) {
      store.setIsProcessing(false);
      return;
    }

    this.isProcessing = true;
    store.setIsProcessing(true);

    try {
      // Process note creations first
      for (const note of pendingNotes) {
        await this.processNote(note);
      }

      // Then process note edits
      for (const edit of pendingEdits) {
        await this.processEdit(edit);
      }
    } catch (error) {
      console.error("Error processing notes queue:", error);
    } finally {
      this.isProcessing = false;
      store.setIsProcessing(false);
    }
  }

  private async processNote(note: OfflineNote) {
    const store = useOfflineNotesStore.getState();

    try {
      // Update status to uploading
      store.updateNoteStatus(note.id, "uploading");

      // Use the notesService.create method from the API client
      const createdNote = await notesService.create({
        body: note.body,
        roomId: note.roomId,
      });

      // If the note has images, upload them
      if (note.images && note.images.length > 0) {
        await this.uploadNoteImages(createdNote.id, note.images);
      }

      store.updateNoteStatus(note.id, "completed");
      toast.success(`Note created successfully`);
    } catch (error) {
      console.error(`Error creating note ${note.id}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      store.updateNoteStatus(note.id, "failed", errorMessage);

      // Auto-retry logic (max 3 retries)
      if (note.retryCount < 3) {
        this.scheduleRetry(note.id, Math.pow(2, note.retryCount) * 1000); // Exponential backoff
      }
    }
  }

  private async uploadNoteImages(noteId: string, imagePaths: string[]) {
    try {
      for (const imagePath of imagePaths) {
        // Upload image to storage and get URL
        const uploadResult = await this.uploadImageToStorage(imagePath);

        if (uploadResult.url) {
          // Add image to note using the API
          await this.addImageToNote(noteId, uploadResult.url);
        }
      }
    } catch (error) {
      console.error("Error uploading note images:", error);
      throw error;
    }
  }

  private async uploadImageToStorage(imagePath: string) {
    try {
      // For React Native, we need to handle the image path differently
      // Since we're in a service, we'll create a mock ImagePickerAsset
      const mockAsset = {
        uri: imagePath,
        width: 800,
        height: 600,
        type: "image" as const,
        fileName: `note-image-${Date.now()}.jpg`,
        fileSize: 0,
      };

      const uploadResult = await uploadImage(mockAsset, {
        folder: `notes/${Date.now()}`,
      });

      return uploadResult;
    } catch (error) {
      console.error("Error uploading image to storage:", error);
      throw error;
    }
  }

  private async addImageToNote(noteId: string, imageUrl: string) {
    try {
      // Add image to note using the API
      // This would depend on your API structure
      // For now, we'll use a placeholder
      console.log(`Adding image ${imageUrl} to note ${noteId}`);

      // You might need to implement this based on your API
      // await notesService.addImage(noteId, { url: imageUrl });
    } catch (error) {
      console.error("Error adding image to note:", error);
      throw error;
    }
  }

  private async processEdit(edit: OfflineNoteEdit) {
    const store = useOfflineNotesStore.getState();

    try {
      // Update status to uploading
      store.updateEditStatus(edit.id, "uploading");

      if (edit.operation === "update") {
        // Update the note using the API client
        await notesService.update(edit.noteId, {
          body: edit.data?.body,
        });

        // If the edit includes images, upload them
        if (edit.data?.images && edit.data.images.length > 0) {
          await this.uploadNoteImages(edit.noteId, edit.data.images);
        }
      } else if (edit.operation === "delete") {
        // Delete the note using the API client
        await notesService.remove(edit.noteId);
      }

      store.updateEditStatus(edit.id, "completed");
      toast.success(`Note ${edit.operation} completed`);
    } catch (error) {
      console.error(`Error ${edit.operation}ing note ${edit.noteId}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      store.updateEditStatus(edit.id, "failed", errorMessage);

      // Auto-retry logic (max 3 retries)
      if (edit.retryCount < 3) {
        this.scheduleRetry(edit.id, Math.pow(2, edit.retryCount) * 1000); // Exponential backoff
      }
    }
  }

  private scheduleRetry(noteId: string, delay: number) {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      const store = useOfflineNotesStore.getState();
      store.retryNote(noteId);
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
    useOfflineNotesStore.getState().setIsProcessing(false);
  }
}

export const offlineNotesProcessor = new OfflineNotesProcessor();
