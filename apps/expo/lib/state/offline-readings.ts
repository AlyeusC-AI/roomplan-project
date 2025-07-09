import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOfflineTasksStore } from "./offline-tasks";

export interface OfflineRoomReading {
  id: string;
  roomId: string;
  projectId: string;
  date: Date;
  humidity: number;
  temperature: number;
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
  metadata?: {
    notes?: string;
    location?: string;
  };
}

export interface OfflineEditOperation {
  id: string;
  readingId: string;
  roomId: string;
  projectId: string;
  operation: "update" | "delete";
  data?: {
    date?: Date;
    humidity?: number;
    temperature?: number;
  };
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date; // Track when the edit was last updated
  retryCount: number;
  error?: string;
}

interface OfflineReadingsState {
  readingsQueue: OfflineRoomReading[];
  editQueue: OfflineEditOperation[];
  isProcessing: boolean;
  addToQueue: (
    reading: Omit<
      OfflineRoomReading,
      "id" | "status" | "createdAt" | "retryCount"
    >
  ) => void;
  addEditToQueue: (
    edit: Omit<
      OfflineEditOperation,
      "id" | "status" | "createdAt" | "updatedAt" | "retryCount"
    >
  ) => void;
  updateExistingEdit: (
    readingId: string,
    data: Partial<OfflineEditOperation["data"]>
  ) => void;
  removeFromQueue: (id: string) => void;
  removeEditFromQueue: (id: string) => void;
  updateReadingStatus: (
    id: string,
    status: OfflineRoomReading["status"],
    error?: string
  ) => void;
  updateEditStatus: (
    id: string,
    status: OfflineEditOperation["status"],
    error?: string
  ) => void;
  updateReadingData: (id: string, data: Partial<OfflineRoomReading>) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  getPendingReadings: () => OfflineRoomReading[];
  getPendingEdits: () => OfflineEditOperation[];
  getFailedReadings: () => OfflineRoomReading[];
  getFailedEdits: () => OfflineEditOperation[];
  getCompletedReadings: () => OfflineRoomReading[];
  retryReading: (id: string) => void;
  retryEdit: (id: string) => void;
  retryAllFailed: () => void;
  getReadingsByRoom: (roomId: string) => OfflineRoomReading[];
  getEditsByReading: (readingId: string) => OfflineEditOperation[];
  getReadingsByProject: (projectId: string) => OfflineRoomReading[];
  getExistingEditForReading: (readingId: string) => OfflineEditOperation | null;
}

export const useOfflineReadingsStore = create<OfflineReadingsState>()(
  persist(
    (set, get) => ({
      readingsQueue: [],
      editQueue: [],
      isProcessing: false,

      addToQueue: (reading) => {
        const newReading: OfflineRoomReading = {
          ...reading,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: "pending",
          createdAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          readingsQueue: [...state.readingsQueue, newReading],
        }));

        // Also add to centralized tasks store
        const tasksStore = useOfflineTasksStore.getState();
        tasksStore.addTask({
          type: "reading",
          title: "Room Reading",
          description: `Add reading for room`,
          metadata: {
            projectId: reading.projectId,
            roomId: reading.roomId,
            originalId: newReading.id,
          },
        });
      },

      addEditToQueue: (edit) => {
        const newEdit: OfflineEditOperation = {
          ...edit,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          editQueue: [...state.editQueue, newEdit],
        }));

        // Also add to centralized tasks store
        const tasksStore = useOfflineTasksStore.getState();
        tasksStore.addTask({
          type: "edit",
          title: `Reading ${edit.operation}`,
          description: `${edit.operation} reading`,
          metadata: {
            readingId: edit.readingId,
            projectId: edit.projectId,
            roomId: edit.roomId,
            originalId: newEdit.id,
            data: edit.data,
          },
        });
      },

      updateExistingEdit: (readingId, data) => {
        set((state) => ({
          editQueue: state.editQueue.map((edit) =>
            edit.readingId === readingId && edit.operation === "update"
              ? {
                  ...edit,
                  data: {
                    ...edit.data,
                    ...data,
                  },
                  updatedAt: new Date(),
                }
              : edit
          ),
        }));
      },

      removeFromQueue: (id) => {
        set((state) => ({
          readingsQueue: state.readingsQueue.filter(
            (reading) => reading.id !== id
          ),
        }));
      },

      removeEditFromQueue: (id) => {
        set((state) => ({
          editQueue: state.editQueue.filter((edit) => edit.id !== id),
        }));
      },

      updateReadingStatus: (id, status, error) => {
        set((state) => ({
          readingsQueue: state.readingsQueue.map((reading) =>
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

      updateEditStatus: (id, status, error) => {
        set((state) => ({
          editQueue: state.editQueue.map((edit) =>
            edit.id === id
              ? {
                  ...edit,
                  status,
                  error,
                  retryCount:
                    status === "failed" ? edit.retryCount + 1 : edit.retryCount,
                }
              : edit
          ),
        }));
      },

      updateReadingData: (id, data) => {
        set((state) => ({
          readingsQueue: state.readingsQueue.map((reading) =>
            reading.id === id ? { ...reading, ...data } : reading
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          readingsQueue: state.readingsQueue.filter(
            (reading) => reading.status !== "completed"
          ),
        }));
      },

      clearFailed: () => {
        set((state) => ({
          readingsQueue: state.readingsQueue.filter(
            (reading) => reading.status !== "failed"
          ),
        }));
      },

      clearAll: () => {
        set({ readingsQueue: [] });
      },

      setIsProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      getPendingReadings: () => {
        return get().readingsQueue.filter(
          (reading) => reading.status === "pending"
        );
      },

      getPendingEdits: () => {
        return get().editQueue.filter((edit) => edit.status === "pending");
      },

      getFailedReadings: () => {
        return get().readingsQueue.filter(
          (reading) => reading.status === "failed"
        );
      },

      getFailedEdits: () => {
        return get().editQueue.filter((edit) => edit.status === "failed");
      },

      getCompletedReadings: () => {
        return get().readingsQueue.filter(
          (reading) => reading.status === "completed"
        );
      },

      retryReading: (id) => {
        set((state) => ({
          readingsQueue: state.readingsQueue.map((reading) =>
            reading.id === id
              ? { ...reading, status: "pending", error: undefined }
              : reading
          ),
        }));
      },

      retryEdit: (id) => {
        set((state) => ({
          editQueue: state.editQueue.map((edit) =>
            edit.id === id
              ? { ...edit, status: "pending", error: undefined }
              : edit
          ),
        }));
      },

      retryAllFailed: () => {
        set((state) => ({
          readingsQueue: state.readingsQueue.map((reading) =>
            reading.status === "failed"
              ? { ...reading, status: "pending", error: undefined }
              : reading
          ),
        }));
      },

      getReadingsByRoom: (roomId) => {
        return get().readingsQueue.filter(
          (reading) => reading.roomId === roomId
        );
      },

      getEditsByReading: (readingId) => {
        return get().editQueue.filter((edit) => edit.readingId === readingId);
      },

      getReadingsByProject: (projectId) => {
        return get().readingsQueue.filter(
          (reading) => reading.projectId === projectId
        );
      },

      getExistingEditForReading: (readingId) => {
        const existingEdit = get().editQueue.find(
          (edit) => edit.readingId === readingId && edit.operation === "update"
        );
        return existingEdit || null;
      },
    }),
    {
      name: "offline-readings-storage",
      partialize: (state) => ({
        readingsQueue: state.readingsQueue,
        editQueue: state.editQueue,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
