import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  urlMap: {
    [imageKey: string]: string;
  };
  logs: string[];
}

interface Actions {
  setUrlMap: (urlMap: Record<string, string>) => void;
  addLog: (message: string) => void;
}

// Define the store with persistence and partialize
export const urlMapStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      urlMap: {},
      logs: [], // Additional state not persisted

      // Actions
      setUrlMap: (urlMap) => set((state) => ({ ...state, urlMap })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "url-map-storage", // The key used for storage
      partialize: (state) => ({ urlMap: state.urlMap }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
