import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOfflineTasksStore } from "./offline-tasks";

export interface OfflineImageUpload {
  id: string;
  projectId: string;
  roomId: string;
  imagePath: string;
  imageUrl: string;
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
  metadata?: {
    size: number;
    type: string;
    name: string;
  };
}

interface OfflineUploadsState {
  uploadQueue: OfflineImageUpload[];
  isProcessing: boolean;
  addToQueue: (
    upload: Omit<
      OfflineImageUpload,
      "id" | "status" | "createdAt" | "retryCount"
    >
  ) => void;
  removeFromQueue: (id: string) => void;
  updateUploadStatus: (
    id: string,
    status: OfflineImageUpload["status"],
    error?: string
  ) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  getPendingUploads: () => OfflineImageUpload[];
  getFailedUploads: () => OfflineImageUpload[];
  getCompletedUploads: () => OfflineImageUpload[];
  retryUpload: (id: string) => void;
  retryAllFailed: () => void;
}

export const useOfflineUploadsStore = create<OfflineUploadsState>()(
  persist(
    (set, get) => ({
      uploadQueue: [],
      isProcessing: false,

      addToQueue: (upload) => {
        const newUpload: OfflineImageUpload = {
          ...upload,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: "pending",
          createdAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          uploadQueue: [...state.uploadQueue, newUpload],
        }));

        // Also add to centralized tasks store
        const tasksStore = useOfflineTasksStore.getState();
        tasksStore.addTask({
          type: "upload",
          title: "Image Upload",
          description: `Upload image to room`,
          metadata: {
            projectId: upload.projectId,
            roomId: upload.roomId,
            imagePath: upload.imagePath,
            originalId: newUpload.id,
          },
        });
      },

      removeFromQueue: (id) => {
        set((state) => ({
          uploadQueue: state.uploadQueue.filter((upload) => upload.id !== id),
        }));
      },

      updateUploadStatus: (id, status, error) => {
        set((state) => ({
          uploadQueue: state.uploadQueue.map((upload) =>
            upload.id === id
              ? {
                  ...upload,
                  status,
                  error,
                  retryCount:
                    status === "failed"
                      ? upload.retryCount + 1
                      : upload.retryCount,
                }
              : upload
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          uploadQueue: state.uploadQueue.filter(
            (upload) => upload.status !== "completed"
          ),
        }));
      },

      clearFailed: () => {
        set((state) => ({
          uploadQueue: state.uploadQueue.filter(
            (upload) => upload.status !== "failed"
          ),
        }));
      },

      clearAll: () => {
        set({ uploadQueue: [] });
      },

      setIsProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      getPendingUploads: () => {
        return get().uploadQueue.filter(
          (upload) => upload.status === "pending"
        );
      },

      getFailedUploads: () => {
        return get().uploadQueue.filter((upload) => upload.status === "failed");
      },

      getCompletedUploads: () => {
        return get().uploadQueue.filter(
          (upload) => upload.status === "completed"
        );
      },

      retryUpload: (id) => {
        set((state) => ({
          uploadQueue: state.uploadQueue.map((upload) =>
            upload.id === id
              ? { ...upload, status: "pending", error: undefined }
              : upload
          ),
        }));
      },

      retryAllFailed: () => {
        set((state) => ({
          uploadQueue: state.uploadQueue.map((upload) =>
            upload.status === "failed"
              ? { ...upload, status: "pending", error: undefined }
              : upload
          ),
        }));
      },
    }),
    {
      name: "offline-uploads-storage",
      partialize: (state) => ({ uploadQueue: state.uploadQueue }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
