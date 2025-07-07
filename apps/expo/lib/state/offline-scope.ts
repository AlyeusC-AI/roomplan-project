import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OfflineRoomEdit {
  id: string;
  roomId: string;
  projectId: string;
  type: "room_update" | "area_affected_update";
  data: any;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  retryCount: number;
  error?: string;
}

interface OfflineScopeStore {
  edits: OfflineRoomEdit[];
  addRoomEdit: (
    edit: Omit<OfflineRoomEdit, "id" | "status" | "createdAt" | "retryCount">
  ) => void;
  addAreaAffectedEdit: (
    edit: Omit<OfflineRoomEdit, "id" | "status" | "createdAt" | "retryCount">
  ) => void;
  updateEditStatus: (
    id: string,
    status: OfflineRoomEdit["status"],
    error?: string
  ) => void;
  removeEdit: (id: string) => void;
  getEditsByRoom: (roomId: string) => OfflineRoomEdit[];
  getPendingEdits: () => OfflineRoomEdit[];
  clearCompletedEdits: () => void;
  incrementRetryCount: (id: string) => void;
}

export const useOfflineScopeStore = create<OfflineScopeStore>()(
  persist(
    (set, get) => ({
      edits: [],

      addRoomEdit: (edit) => {
        const newEdit: OfflineRoomEdit = {
          ...edit,
          id: `room-edit-${Date.now()}-${Math.random()}`,
          status: "pending",
          createdAt: new Date().toISOString(),
          retryCount: 0,
        };
        set((state) => ({
          edits: [...state.edits, newEdit],
        }));
      },

      addAreaAffectedEdit: (edit) => {
        const newEdit: OfflineRoomEdit = {
          ...edit,
          id: `area-edit-${Date.now()}-${Math.random()}`,
          status: "pending",
          createdAt: new Date().toISOString(),
          retryCount: 0,
        };
        set((state) => ({
          edits: [...state.edits, newEdit],
        }));
      },

      updateEditStatus: (id, status, error) => {
        set((state) => ({
          edits: state.edits.map((edit) =>
            edit.id === id ? { ...edit, status, error } : edit
          ),
        }));
      },

      removeEdit: (id) => {
        set((state) => ({
          edits: state.edits.filter((edit) => edit.id !== id),
        }));
      },

      getEditsByRoom: (roomId) => {
        return get().edits.filter((edit) => edit.roomId === roomId);
      },

      getPendingEdits: () => {
        return get().edits.filter((edit) => edit.status === "pending");
      },

      clearCompletedEdits: () => {
        set((state) => ({
          edits: state.edits.filter((edit) => edit.status !== "completed"),
        }));
      },

      incrementRetryCount: (id) => {
        set((state) => ({
          edits: state.edits.map((edit) =>
            edit.id === id ? { ...edit, retryCount: edit.retryCount + 1 } : edit
          ),
        }));
      },
    }),
    {
      name: "offline-scope-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
