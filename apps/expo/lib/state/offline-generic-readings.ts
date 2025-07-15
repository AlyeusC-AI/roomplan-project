import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OfflineGenericReading {
  id: string;
  roomReadingId: string;
  projectId: string;
  value: string;
  humidity: number;
  temperature: number;
  images: string[];
  type: "new" | "edit";
  originalReadingId?: string; // For edits, reference the original reading
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
}

interface OfflineGenericReadingsState {
  readings: OfflineGenericReading[];
  isProcessing: boolean;

  // Add new generic reading
  addNewGenericReading: (
    reading: Omit<
      OfflineGenericReading,
      "id" | "type" | "status" | "createdAt" | "retryCount"
    >
  ) => void;

  // Add edit for existing generic reading
  addEdit: (
    reading: Omit<
      OfflineGenericReading,
      "id" | "type" | "status" | "createdAt" | "retryCount"
    > & { originalReadingId: string }
  ) => void;

  // Update existing offline generic reading
  updateReading: (
    id: string,
    data: Partial<
      Pick<
        OfflineGenericReading,
        "value" | "humidity" | "temperature" | "images"
      >
    >
  ) => void;

  // Remove reading
  removeReading: (id: string) => void;

  // Update status
  updateStatus: (
    id: string,
    status: OfflineGenericReading["status"],
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
  getPendingReadings: () => OfflineGenericReading[];
  getFailedReadings: () => OfflineGenericReading[];
  getCompletedReadings: () => OfflineGenericReading[];
  getReadingsByRoomReading: (roomReadingId: string) => OfflineGenericReading[];
  getEditForReading: (readingId: string) => OfflineGenericReading | null;
  getNewReadingsForRoomReading: (
    roomReadingId: string
  ) => OfflineGenericReading[];
  getEditsForRoomReading: (roomReadingId: string) => OfflineGenericReading[];
}

export const useOfflineGenericReadingsStore =
  create<OfflineGenericReadingsState>()(
    persist(
      (set, get) => ({
        readings: [],
        isProcessing: false,

        addNewGenericReading: (reading) => {
          const newReading: OfflineGenericReading = {
            ...reading,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: "new",
            status: "pending",
            createdAt: new Date(),
            retryCount: 0,
          };
          set((state) => ({
            readings: [...state.readings, newReading],
          }));
        },

        addEdit: (reading) => {
          const newEdit: OfflineGenericReading = {
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
          return get().readings.filter(
            (reading) => reading.status === "pending"
          );
        },

        getFailedReadings: () => {
          return get().readings.filter(
            (reading) => reading.status === "failed"
          );
        },

        getCompletedReadings: () => {
          return get().readings.filter(
            (reading) => reading.status === "completed"
          );
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
                reading.type === "edit" &&
                reading.originalReadingId === readingId
            ) || null
          );
        },

        getNewReadingsForRoomReading: (roomReadingId) => {
          return get().readings.filter(
            (reading) =>
              reading.roomReadingId === roomReadingId && reading.type === "new"
          );
        },

        getEditsForRoomReading: (roomReadingId) => {
          return get().readings.filter(
            (reading) =>
              reading.roomReadingId === roomReadingId && reading.type === "edit"
          );
        },
      }),
      {
        name: "offline-generic-readings-storage",
        partialize: (state) => ({ readings: state.readings }),
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
