import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOfflineTasksStore } from "./offline-tasks";

export interface OfflineNote {
  id: string;
  roomId: string;
  projectId: string;
  body: string;
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
  images?: string[]; // Array of image paths
  metadata?: {
    originalId?: string;
    isUpdate?: boolean;
    isDelete?: boolean;
  };
}

export interface OfflineNoteEdit {
  id: string;
  noteId: string;
  roomId: string;
  projectId: string;
  operation: "update" | "delete";
  data?: {
    body?: string;
    images?: string[];
  };
  status: "pending" | "uploading" | "completed" | "failed";
  createdAt: Date;
  retryCount: number;
  error?: string;
}

interface OfflineNotesState {
  notesQueue: OfflineNote[];
  editQueue: OfflineNoteEdit[];
  isProcessing: boolean;
  addToQueue: (
    note: Omit<OfflineNote, "id" | "status" | "createdAt" | "retryCount">
  ) => void;
  addEditToQueue: (
    edit: Omit<OfflineNoteEdit, "id" | "status" | "createdAt" | "retryCount">
  ) => void;
  removeFromQueue: (id: string) => void;
  removeEditFromQueue: (id: string) => void;
  updateNoteStatus: (
    id: string,
    status: OfflineNote["status"],
    error?: string
  ) => void;
  updateEditStatus: (
    id: string,
    status: OfflineNoteEdit["status"],
    error?: string
  ) => void;
  updateNoteData: (id: string, data: Partial<OfflineNote>) => void;
  updateOfflineNote: (id: string, body: string) => void;
  addImageToOfflineNote: (noteId: string, imagePath: string) => void;
  removeImageFromOfflineNote: (noteId: string, imagePath: string) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  getPendingNotes: () => OfflineNote[];
  getPendingEdits: () => OfflineNoteEdit[];
  getFailedNotes: () => OfflineNote[];
  getFailedEdits: () => OfflineNoteEdit[];
  getCompletedNotes: () => OfflineNote[];
  retryNote: (id: string) => void;
  retryEdit: (id: string) => void;
  retryAllFailed: () => void;
  getNotesByRoom: (roomId: string) => OfflineNote[];
  getEditsByNote: (noteId: string) => OfflineNoteEdit[];
  getNotesByProject: (projectId: string) => OfflineNote[];
}

export const useOfflineNotesStore = create<OfflineNotesState>()(
  persist(
    (set, get) => ({
      notesQueue: [],
      editQueue: [],
      isProcessing: false,

      addToQueue: (note) => {
        const newNote: OfflineNote = {
          ...note,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: "pending",
          createdAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          notesQueue: [...state.notesQueue, newNote],
        }));

        // Also add to centralized tasks store
        const tasksStore = useOfflineTasksStore.getState();
        tasksStore.addTask({
          type: "note",
          title: "Note Creation",
          description: `Create note for room`,
          metadata: {
            projectId: note.projectId,
            roomId: note.roomId,
            originalId: newNote.id,
          },
        });
      },

      addEditToQueue: (edit) => {
        const newEdit: OfflineNoteEdit = {
          ...edit,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: "pending",
          createdAt: new Date(),
          retryCount: 0,
        };
        set((state) => ({
          editQueue: [...state.editQueue, newEdit],
        }));

        // Also add to centralized tasks store
        const tasksStore = useOfflineTasksStore.getState();
        tasksStore.addTask({
          type: "note-edit",
          title: `Note ${edit.operation}`,
          description: `${edit.operation} note`,
          metadata: {
            noteId: edit.noteId,
            projectId: edit.projectId,
            roomId: edit.roomId,
            originalId: newEdit.id,
            data: edit.data,
          },
        });
      },

      removeFromQueue: (id) => {
        set((state) => ({
          notesQueue: state.notesQueue.filter((note) => note.id !== id),
        }));
      },

      removeEditFromQueue: (id) => {
        set((state) => ({
          editQueue: state.editQueue.filter((edit) => edit.id !== id),
        }));
      },

      updateNoteStatus: (id, status, error) => {
        set((state) => ({
          notesQueue: state.notesQueue.map((note) =>
            note.id === id
              ? {
                  ...note,
                  status,
                  error,
                  retryCount:
                    status === "failed" ? note.retryCount + 1 : note.retryCount,
                }
              : note
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

      updateNoteData: (id, data) => {
        set((state) => ({
          notesQueue: state.notesQueue.map((note) =>
            note.id === id ? { ...note, ...data } : note
          ),
        }));
      },

      updateOfflineNote: (id, body) => {
        set((state) => ({
          notesQueue: state.notesQueue.map((note) =>
            note.id === id ? { ...note, body } : note
          ),
        }));
      },

      addImageToOfflineNote: (noteId, imagePath) => {
        set((state) => ({
          notesQueue: state.notesQueue.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  images: [...(note.images || []), imagePath],
                }
              : note
          ),
        }));
      },

      removeImageFromOfflineNote: (noteId, imagePath) => {
        set((state) => ({
          notesQueue: state.notesQueue.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  images: note.images?.filter((img) => img !== imagePath) || [],
                }
              : note
          ),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          notesQueue: state.notesQueue.filter(
            (note) => note.status !== "completed"
          ),
        }));
      },

      clearFailed: () => {
        set((state) => ({
          notesQueue: state.notesQueue.filter(
            (note) => note.status !== "failed"
          ),
        }));
      },

      clearAll: () => {
        set({ notesQueue: [], editQueue: [] });
      },

      setIsProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      getPendingNotes: () => {
        return get().notesQueue.filter((note) => note.status === "pending");
      },

      getPendingEdits: () => {
        return get().editQueue.filter((edit) => edit.status === "pending");
      },

      getFailedNotes: () => {
        return get().notesQueue.filter((note) => note.status === "failed");
      },

      getFailedEdits: () => {
        return get().editQueue.filter((edit) => edit.status === "failed");
      },

      getCompletedNotes: () => {
        return get().notesQueue.filter((note) => note.status === "completed");
      },

      retryNote: (id) => {
        set((state) => ({
          notesQueue: state.notesQueue.map((note) =>
            note.id === id
              ? { ...note, status: "pending", error: undefined }
              : note
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
          notesQueue: state.notesQueue.map((note) =>
            note.status === "failed"
              ? { ...note, status: "pending", error: undefined }
              : note
          ),
          editQueue: state.editQueue.map((edit) =>
            edit.status === "failed"
              ? { ...edit, status: "pending", error: undefined }
              : edit
          ),
        }));
      },

      getNotesByRoom: (roomId) => {
        return get().notesQueue.filter((note) => note.roomId === roomId);
      },

      getEditsByNote: (noteId) => {
        return get().editQueue.filter((edit) => edit.noteId === noteId);
      },

      getNotesByProject: (projectId) => {
        return get().notesQueue.filter((note) => note.projectId === projectId);
      },
    }),
    {
      name: "offline-notes-storage",
      partialize: (state) => ({
        notesQueue: state.notesQueue,
        editQueue: state.editQueue,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
