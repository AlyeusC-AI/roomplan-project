import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  members: User[];
  logs: string[];
}

interface Actions {
  setMembers: (session: User[]) => void;
  addLog: (message: string) => void;
}

// Define the store with persistence and partialize
export const teamMemberStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      members: [],
      logs: [], // Additional state not persisted

      // Actions
      setMembers: (members) => set((state) => ({ ...state, members })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "team-member-storage", // The key used for storage
      partialize: (state) => ({ members: state.members }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
