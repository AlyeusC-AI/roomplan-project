import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  session: Session | null;
  logs: string[];
}

interface Actions {
  setSession: (session: Session | null) => void;
  addLog: (message: string) => void;
}

// Define the store with persistence and partialize
export const userStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      session: null, // Number of fishes
      logs: [], // Additional state not persisted

      // Actions
      // Add a fish to the count
      setSession: (session) => set((state) => ({ session: session })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "session-storage", // The key used for storage

      //optional: Persist only the `fishes` state
      //  It is used to selectively persist specific keys from the state instead of storing the entire state object.
      partialize: (state) => ({ session: state.session }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
