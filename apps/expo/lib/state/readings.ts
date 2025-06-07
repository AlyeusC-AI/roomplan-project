import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  readings: RoomReading[];
  genericReadings: GenericRoomReading[];
  logs: string[];
}

interface Actions {
  setReadings: (rooms: RoomReading[]) => void;
  addReading: (project: RoomReading) => void;
  setGenericReadings: (rooms: GenericRoomReading[]) => void;
  addGenericReading: (project: GenericRoomReading) => void;
  addLog: (message: string) => void;
}

// Define the store with persistence and partialize
export const readingStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      readings: [],
      genericReadings: [],
      logs: [],

      // Actions
      // Add a fish to the count
      setReadings: (readings) => set(() => ({ readings })),
      addReading: (reading) =>
        set((state) => ({ readings: [...state.readings, reading] })),
      setGenericReadings: (genericReadings) => set(() => ({ genericReadings })),
      addGenericReading: (genericReading) =>
        set((state) => ({
          genericReadings: [...state.genericReadings, genericReading],
        })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "reading-storage", // The key used for storage

      //optional: Persist only the `fishes` state
      //  It is used to selectively persist specific keys from the state instead of storing the entire state object.
      partialize: (state) => ({ readings: state.readings }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
