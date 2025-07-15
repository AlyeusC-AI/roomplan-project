import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OfflineWallReading {
  id: string;
  wallId: string;
  roomReadingId: string;
  projectId: string;
  reading: number;
  images: string[];
  type: "new" | "edit";
  originalReadingId?: string; // For edits, reference the original reading
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
}

interface OfflineWallReadingsState {
  readings: OfflineWallReading[];
  isProcessing: boolean;

  // Add new wall reading
  addNewWallReading: (
    reading: Omit<
      OfflineWallReading,
      "id" | "type" | "status" | "createdAt" | "retryCount"
    >
  ) => void;

  // Add edit for existing wall reading
  addEdit: (
    reading: Omit<
      OfflineWallReading,
      "id" | "type" | "status" | "createdAt" | "retryCount"
    > & { originalReadingId: string }
  ) => void;

  // Update existing offline wall reading
  updateReading: (
    id: string,
    data: Partial<Pick<OfflineWallReading, "reading" | "images">>
  ) => void;

  // Remove reading
  removeReading: (id: string) => void;

  // Update status
  updateStatus: (
    id: string,
    status: OfflineWallReading["status"],
    error?: string
  ) => void;

  // Retry failed reading
  retryReading: (id: string) => void;

  // Clear completed/failed readings
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;

  // Set processing state
  setIsProcessing: (isProcessing: boolean) => void;

  // Getters
  getPendingReadings: () => OfflineWallReading[];
  getFailedReadings: () => OfflineWallReading[];
  getCompletedReadings: () => OfflineWallReading[];
  getReadingsByWall: (wallId: string) => OfflineWallReading[];
  getReadingsByRoomReading: (roomReadingId: string) => OfflineWallReading[];
  getEditForReading: (readingId: string) => OfflineWallReading | null;
  getNewReadingsForWall: (wallId: string) => OfflineWallReading[];
  getEditsForWall: (wallId: string) => OfflineWallReading[];
}

export const useOfflineWallReadingsStore = create<OfflineWallReadingsState>()(
  persist(
    (set, get) => ({
      readings: [],
      isProcessing: false,

      addNewWallReading: (reading) => {
        const newReading: OfflineWallReading = {
          ...reading,
          id: reading.wallId,
          type: "new",
          status: "pending",
          createdAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          readings: state.readings.find(
            (reading) =>
              reading.id === newReading.id &&
              reading.roomReadingId === newReading.roomReadingId
          )
            ? state.readings.map((reading) =>
                reading.id === newReading.id &&
                reading.roomReadingId === newReading.roomReadingId
                  ? newReading
                  : reading
              )
            : [...state.readings, newReading],
        }));
      },

      addEdit: (reading) => {
        const newEdit: OfflineWallReading = {
          ...reading,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: "edit",
          status: "pending",
          createdAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          readings: [...state.readings, newEdit],
        }));
      },

      updateReading: (id, data) => {
        set((state) => ({
          readings: state.readings.map((reading) =>
            reading.id === id
              ? {
                  ...reading,
                  ...data,
                }
              : reading
          ),
        }));
      },

      removeReading: (id) => {
        set((state) => ({
          readings: state.readings.filter((reading) => reading.id !== id),
        }));
      },

      updateStatus: (id, status, error) => {
        set((state) => ({
          readings: state.readings.map((reading) =>
            reading.id === id
              ? {
                  ...reading,
                  status,
                  error,
                  retryCount:
                    status === "failed"
                      ? reading.retryCount + 1
                      : reading.retryCount,
                }
              : reading
          ),
        }));
      },

      retryReading: (id) => {
        set((state) => ({
          readings: state.readings.map((reading) =>
            reading.id === id
              ? { ...reading, status: "pending", error: undefined }
              : reading
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          readings: state.readings.filter(
            (reading) => reading.status !== "completed"
          ),
        }));
      },

      clearFailed: () => {
        set((state) => ({
          readings: state.readings.filter(
            (reading) => reading.status !== "failed"
          ),
        }));
      },

      clearAll: () => {
        set({ readings: [] });
      },

      setIsProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      getPendingReadings: () => {
        return get().readings.filter((reading) => reading.status === "pending");
      },

      getFailedReadings: () => {
        return get().readings.filter((reading) => reading.status === "failed");
      },

      getCompletedReadings: () => {
        return get().readings.filter(
          (reading) => reading.status === "completed"
        );
      },

      getReadingsByWall: (wallId) => {
        return get().readings.filter((reading) => reading.wallId === wallId);
      },

      getReadingsByRoomReading: (roomReadingId) => {
        return get().readings.filter(
          (reading) => reading.roomReadingId === roomReadingId
        );
      },

      getEditForReading: (readingId) => {
        return (
          get().readings.find(
            (reading) =>
              reading.type === "edit" && reading.originalReadingId === readingId
          ) || null
        );
      },

      getNewReadingsForWall: (wallId) => {
        return get().readings.filter(
          (reading) => reading.wallId === wallId && reading.type === "new"
        );
      },

      getEditsForWall: (wallId) => {
        return get().readings.filter(
          (reading) => reading.wallId === wallId && reading.type === "edit"
        );
      },
    }),
    {
      name: "offline-wall-readings-storage",
      partialize: (state) => ({ readings: state.readings }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
