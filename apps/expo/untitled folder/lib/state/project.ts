import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  project: Project | null;
  logs: string[];
}

interface Actions {
  setProject: (project: Project) => void;
  updateProject: (project: Partial<Project>) => void;
  addLog: (message: string) => void;
  addAssignee: (assignee: Assignee) => void;
  removeAssignee: (assigneeId: string) => void;
}

// Define the store with persistence and partialize
export const projectStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      project: null,
      logs: [],

      // Actions
      // Add a fish to the count
      setProject: (project) => set(() => ({ project })),
      updateProject: (project) =>
        set((state) => ({ project: { ...state.project!, ...project } })),
      addAssignee: (assignee) =>
        set((state) => ({
          project: {
            ...state.project!,
            assignees: [...state.project!.assignees, assignee],
          },
        })),
      removeAssignee: (assigneeId) =>
        set((state) => ({
          project: {
            ...state.project!,
            assignees: state.project!.assignees.filter(
              (a) => a.userId !== assigneeId
            ),
          },
        })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "project-storage", // The key used for storage

      //optional: Persist only the `fishes` state
      //  It is used to selectively persist specific keys from the state instead of storing the entire state object.
      partialize: (state) => ({ project: state.project }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
