import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOfflineTasksStore } from "./offline-tasks";

export interface OfflineReading {
  id: string;
  roomId: string;
  projectId: string;
  date: Date;
  humidity: number;
  temperature: number;
  type: "new" | "edit";
  originalReadingId?: string; // For edits, reference the original reading
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
}

interface OfflineReadingsState {
  readings: OfflineReading[];
  isProcessing: boolean;

  // Add new reading
  addNewReading: (
    reading: Omit<
      OfflineReading,
      "id" | "type" | "status" | "createdAt" | "retryCount"
    >
  ) => void;

  // Add edit for existing reading
  addEdit: (
    reading: Omit<
      OfflineReading,
      "id" | "type" | "status" | "createdAt" | "retryCount"
    > & { originalReadingId: string }
  ) => void;

  // Update existing offline reading
  updateReading: (
    id: string,
    data: Partial<Pick<OfflineReading, "date" | "humidity" | "temperature">>
  ) => void;

  // Remove reading
  removeReading: (id: string) => void;

  // Update status
  updateStatus: (
    id: string,
    status: OfflineReading["status"],
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
  getPendingReadings: () => OfflineReading[];
  getFailedReadings: () => OfflineReading[];
  getCompletedReadings: () => OfflineReading[];
  getReadingsByRoom: (roomId: string) => OfflineReading[];
  getReadingsByProject: (projectId: string) => OfflineReading[];
  getEditForReading: (readingId: string) => OfflineReading | null;
  getNewReadingsForRoom: (roomId: string) => OfflineReading[];
  getEditsForRoom: (roomId: string) => OfflineReading[];
}

export const useOfflineReadingsStore = create<OfflineReadingsState>()(
  persist(
    (set, get) => ({
      readings: [],
      isProcessing: false,

      addNewReading: (reading) => {
        const newReading: OfflineReading = {
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

        // Also add to centralized tasks store
        const tasksStore = useOfflineTasksStore.getState();
        tasksStore.addTask({
          type: "reading",
          title: "Reading Creation",
          description: `Create new reading for room`,
          metadata: {
            projectId: reading.projectId,
            roomId: reading.roomId,
            originalId: newReading.id,
          },
        });
      },

      addEdit: (reading) => {
        const newEdit: OfflineReading = {
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

        // Also add to centralized tasks store
        const tasksStore = useOfflineTasksStore.getState();
        tasksStore.addTask({
          type: "edit",
          title: "Reading Edit",
          description: `Edit existing reading`,
          metadata: {
            projectId: reading.projectId,
            roomId: reading.roomId,
            readingId: reading.originalReadingId,
            originalId: newEdit.id,
          },
        });
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

      getReadingsByRoom: (roomId) => {
        return get().readings.filter((reading) => reading.roomId === roomId);
      },

      getReadingsByProject: (projectId) => {
        return get().readings.filter(
          (reading) => reading.projectId === projectId
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

      getNewReadingsForRoom: (roomId) => {
        return get().readings.filter(
          (reading) => reading.roomId === roomId && reading.type === "new"
        );
      },

      getEditsForRoom: (roomId) => {
        return get().readings.filter(
          (reading) => reading.roomId === roomId && reading.type === "edit"
        );
      },
    }),
    {
      name: "offline-readings-storage",
      partialize: (state) => ({ readings: state.readings }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
