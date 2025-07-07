import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOfflineUploadsStore } from "./offline-uploads";
import { useOfflineReadingsStore } from "./offline-readings";
import { useOfflineNotesStore } from "./offline-notes";
import { useOfflineScopeStore } from "./offline-scope";
import { offlineUploadProcessor } from "../services/offline-upload-processor";
import { offlineReadingsProcessor } from "../services/offline-readings-processor";
import { offlineEditProcessor } from "../services/offline-edit-processor";
import { offlineNotesProcessor } from "../services/offline-notes-processor";
import { offlineScopeProcessor } from "../services/offline-scope-processor";

export interface OfflineTask {
  id: string;
  type: "upload" | "reading" | "edit" | "note" | "note-edit" | "scope-edit";
  status: "pending" | "processing" | "completed" | "failed";
  title: string;
  description: string;
  createdAt: Date;
  retryCount: number;
  error?: string;
  metadata: {
    projectId?: string;
    roomId?: string;
    readingId?: string;
    noteId?: string;
    imagePath?: string;
    data?: any;
    originalId?: string;
  };
}

interface OfflineTasksState {
  tasks: OfflineTask[];
  isProcessing: boolean;
  addTask: (
    task: Omit<OfflineTask, "id" | "status" | "createdAt" | "retryCount">
  ) => void;
  removeTask: (id: string) => void;
  updateTaskStatus: (
    id: string,
    status: OfflineTask["status"],
    error?: string
  ) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  getPendingTasks: () => OfflineTask[];
  getFailedTasks: () => OfflineTask[];
  getCompletedTasks: () => OfflineTask[];
  getTasksByProject: (projectId: string) => OfflineTask[];
  getTasksByType: (type: OfflineTask["type"]) => OfflineTask[];
  retryTask: (id: string) => void;
  retryAllFailed: () => void;
  executeTask: (id: string) => Promise<void>;
  executeAllPending: () => Promise<void>;
  syncWithExistingStores: () => void;
}

export const useOfflineTasksStore = create<OfflineTasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isProcessing: false,

      addTask: (task) => {
        const newTask: OfflineTask = {
          ...task,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: "pending",
          createdAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      updateTaskStatus: (id, status, error) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status,
                  error,
                  retryCount:
                    status === "failed" ? task.retryCount + 1 : task.retryCount,
                }
              : task
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== "completed"),
        }));
      },

      clearFailed: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.status !== "failed"),
        }));
      },

      clearAll: () => {
        set({ tasks: [] });
      },

      setIsProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      getPendingTasks: () => {
        return get().tasks.filter((task) => task.status === "pending");
      },

      getFailedTasks: () => {
        return get().tasks.filter((task) => task.status === "failed");
      },

      getCompletedTasks: () => {
        return get().tasks.filter((task) => task.status === "completed");
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter(
          (task) => task.metadata.projectId === projectId
        );
      },

      getTasksByType: (type) => {
        return get().tasks.filter((task) => task.type === type);
      },

      retryTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: "pending", error: undefined }
              : task
          ),
        }));
      },

      retryAllFailed: () => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.status === "failed"
              ? { ...task, status: "pending", error: undefined }
              : task
          ),
        }));
      },

      executeTask: async (id: string) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task || task.status !== "pending") return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "processing" } : t
          ),
        }));

        try {
          // For now, just trigger the existing processors
          // The actual processing will be handled by the existing stores
          switch (task.type) {
            case "upload":
              // Trigger upload processor
              offlineUploadProcessor.startProcessing();
              break;
            case "reading":
              // Trigger readings processor
              offlineReadingsProcessor.startProcessing();
              break;
            case "edit":
              // Trigger edit processor
              offlineEditProcessor.startProcessing();
              break;
            case "note":
            case "note-edit":
              // Trigger notes processor
              offlineNotesProcessor.startProcessing();
              break;
            case "scope-edit":
              // Trigger scope processor
              offlineScopeProcessor.processEdits();
              break;
          }

          // Mark as completed after a delay to allow processing
          setTimeout(() => {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, status: "completed" } : t
              ),
            }));
          }, 2000);
        } catch (error: any) {
          console.error(`Error executing task ${id}:`, error);
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "failed",
                    error: error.message || "Execution failed",
                  }
                : t
            ),
          }));
        }
      },

      executeAllPending: async () => {
        const pendingTasks = get().getPendingTasks();
        if (pendingTasks.length === 0) return;

        set({ isProcessing: true });

        try {
          // Trigger all processors
          offlineUploadProcessor.startProcessing();
          offlineReadingsProcessor.startProcessing();
          offlineEditProcessor.startProcessing();
          offlineNotesProcessor.startProcessing();
          offlineScopeProcessor.processEdits();

          // Mark all pending tasks as completed after processing
          setTimeout(() => {
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.status === "pending"
                  ? { ...task, status: "completed" }
                  : task
              ),
              isProcessing: false,
            }));
          }, 3000);
        } catch (error) {
          console.error("Error executing all pending tasks:", error);
          set({ isProcessing: false });
        }
      },

      syncWithExistingStores: () => {
        const uploadsStore = useOfflineUploadsStore.getState();
        const readingsStore = useOfflineReadingsStore.getState();
        const notesStore = useOfflineNotesStore.getState();
        const scopeStore = useOfflineScopeStore.getState();

        const pendingUploads = uploadsStore.getPendingUploads();
        const pendingReadings = readingsStore.getPendingReadings();
        const pendingEdits = readingsStore.getPendingEdits();
        const pendingNotes = notesStore.getPendingNotes();
        const pendingNoteEdits = notesStore.getPendingEdits();
        const pendingScopeEdits = scopeStore.getPendingEdits();

        const existingTaskIds = get().tasks.map(
          (task) => task.metadata.originalId || task.id
        );
        const newTasks: OfflineTask[] = [];

        // Add upload tasks
        pendingUploads.forEach((upload) => {
          if (!existingTaskIds.includes(upload.id)) {
            newTasks.push({
              id: `upload-${upload.id}`,
              type: "upload",
              status: "pending",
              title: "Image Upload",
              description: `Upload image to room`,
              createdAt: new Date(),
              retryCount: 0,
              metadata: {
                projectId: upload.projectId,
                roomId: upload.roomId,
                imagePath: upload.imagePath,
                originalId: upload.id,
              },
            });
          }
        });

        // Add reading tasks
        pendingReadings.forEach((reading) => {
          if (!existingTaskIds.includes(reading.id)) {
            newTasks.push({
              id: `reading-${reading.id}`,
              type: "reading",
              status: "pending",
              title: "Room Reading",
              description: `Add reading for room`,
              createdAt: new Date(),
              retryCount: 0,
              metadata: {
                projectId: reading.projectId,
                roomId: reading.roomId,
                originalId: reading.id,
              },
            });
          }
        });

        // Add edit tasks
        pendingEdits.forEach((edit) => {
          if (!existingTaskIds.includes(edit.id)) {
            newTasks.push({
              id: `edit-${edit.id}`,
              type: "edit",
              status: "pending",
              title: `Reading ${edit.operation}`,
              description: `${edit.operation} reading`,
              createdAt: new Date(),
              retryCount: 0,
              metadata: {
                readingId: edit.readingId,
                originalId: edit.id,
                data: edit.data,
              },
            });
          }
        });

        // Add note tasks
        pendingNotes.forEach((note) => {
          if (!existingTaskIds.includes(note.id)) {
            newTasks.push({
              id: `note-${note.id}`,
              type: "note",
              status: "pending",
              title: "Note Creation",
              description: `Create note for room`,
              createdAt: new Date(),
              retryCount: 0,
              metadata: {
                projectId: note.projectId,
                roomId: note.roomId,
                originalId: note.id,
              },
            });
          }
        });

        // Add note edit tasks
        pendingNoteEdits.forEach((edit) => {
          if (!existingTaskIds.includes(edit.id)) {
            newTasks.push({
              id: `note-edit-${edit.id}`,
              type: "note-edit",
              status: "pending",
              title: `Note ${edit.operation}`,
              description: `${edit.operation} note`,
              createdAt: new Date(),
              retryCount: 0,
              metadata: {
                noteId: edit.noteId,
                projectId: edit.projectId,
                roomId: edit.roomId,
                originalId: edit.id,
                data: edit.data,
              },
            });
          }
        });

        // Add scope edit tasks
        pendingScopeEdits.forEach((edit) => {
          if (!existingTaskIds.includes(edit.id)) {
            newTasks.push({
              id: `scope-edit-${edit.id}`,
              type: "scope-edit",
              status: "pending",
              title: `Scope ${edit.type === "room_update" ? "Room Update" : "Area Affected Update"}`,
              description: `${edit.type === "room_update" ? "Update room" : "Update area affected"} for room`,
              createdAt: new Date(),
              retryCount: 0,
              metadata: {
                projectId: edit.projectId,
                roomId: edit.roomId,
                originalId: edit.id,
                data: edit.data,
              },
            });
          }
        });

        if (newTasks.length > 0) {
          set((state) => ({
            tasks: [...state.tasks, ...newTasks],
          }));
        }
      },
    }),
    {
      name: "offline-tasks-storage",
      partialize: (state) => ({ tasks: state.tasks }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
