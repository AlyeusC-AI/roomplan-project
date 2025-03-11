import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ViewMode = "list" | "grid";

interface State {
  projectViewMode: ViewMode;
}

interface Actions {
  setProjectViewMode: (mode: ViewMode) => void;
}

export const uiPreferencesStore = create<State & Actions>()(
  persist(
    (set) => ({
      projectViewMode: "list",
      setProjectViewMode: (mode) =>
        set((state) => ({
          projectViewMode: mode,
        })),
    }),
    {
      name: "ui-preferences-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
