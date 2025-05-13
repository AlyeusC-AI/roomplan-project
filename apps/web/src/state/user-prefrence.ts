import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type DashboardView = "listView" | "boardView" | "mapView";
interface State {
  savedDashboardView: DashboardView;
}

interface Actions {
  updatePreference: (preference: Partial<State>) => void;
}

export const userPreferenceStore = create<State & Actions>()(
  persist(
    (set) => ({
      savedDashboardView: "listView",
      updatePreference: (preference) =>
        set((state) => ({ ...state, ...preference })),
    }),

    {
      name: "userPreference",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
