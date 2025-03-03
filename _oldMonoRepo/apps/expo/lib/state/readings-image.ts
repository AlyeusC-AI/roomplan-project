import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  rooms: RoomWithInferences[];
  logs: string[];
}

interface Actions {
  setRooms: (rooms: RoomWithInferences[]) => void;
  addRoom: (project: RoomWithInferences) => void;
  addLog: (message: string) => void;
}

// Define the store with persistence and partialize
export const roomInferenceStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      rooms: [],
      logs: [],

      // Actions
      // Add a fish to the count
      setRooms: (readings) => set(() => ({ rooms: readings })),
      addRoom: (reading) =>
        set((state) => ({ rooms: [...state.rooms, reading] })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "reading-inference-storage", // The key used for storage

      //optional: Persist only the `fishes` state
      //  It is used to selectively persist specific keys from the state instead of storing the entire state object.
      partialize: (state) => ({ rooms: state.rooms }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
