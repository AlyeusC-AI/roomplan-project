import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  projects: ProjectType[];
  logs: string[];
}

interface Actions {
  setProjects: (session: ProjectType[]) => void;
  addLog: (message: string) => void;
}

// Define the store with persistence and partialize
export const projectsStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      projects: [], 
      logs: [],

      // Actions
      // Add a fish to the count
      setProjects: (projects) => set((state) => ({ projects })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "projects-storage", // The key used for storage

      //optional: Persist only the `fishes` state
      //  It is used to selectively persist specific keys from the state instead of storing the entire state object.
      partialize: (state) => ({ projects: state.projects }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
