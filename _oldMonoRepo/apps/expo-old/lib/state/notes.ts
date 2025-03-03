import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  notes: RoomWithNotes[];
  logs: string[];
}

interface Actions {
  setNotes: (notes: RoomWithNotes[]) => void;
  addLog: (message: string) => void;
  addNote: (notes: Note, roomId: string) => void;
  updateNote: (notes: Note, roomId: string) => void;
  deleteNote: (noteId: string, roomId: string) => void;
}

// Define the store with persistence and partialize
export const notesStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      notes: [],
      logs: [],

      // Actions
      // Add a fish to the count
      setNotes: (notes) => set(() => ({ notes })),
      addNote: (note, roomId) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.publicId === roomId ? { ...n, Notes: [...n.Notes, note] } : n
          ),
        })),
      updateNote: (note, roomId) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.publicId === roomId
              ? {
                  ...n,
                  Notes: n.Notes.map((x) =>
                    x.publicId === note.publicId ? note : x
                  ),
                }
              : n
          ),
        })),
      deleteNote: (note, roomId) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.publicId === roomId
              ? {
                  ...n,
                  Notes: n.Notes.filter((x) => x.publicId !== note),
                }
              : n
          ),
        })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "notes-storage", // The key used for storage

      //optional: Persist only the `fishes` state
      //  It is used to selectively persist specific keys from the state instead of storing the entire state object.
      partialize: (state) => ({ notes: state.notes }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
