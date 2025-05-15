import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
type DashboardView = "listView" | "boardView" | "mapView";
export type PhotoView = "photoGridView" | "photoListView";
export type PhotoGroupBy = "room" | "date";
// type PhotoSort = "createdAt" | "order" | "url";
interface State {
  savedDashboardView: DashboardView;
  savedPhotoView: PhotoView;
  savedPhotoGroupBy: PhotoGroupBy;
  // savedPhotoSort: PhotoSort;
}

interface Actions {
  updatePreference: (preference: Partial<State>) => void;
}

export const userPreferenceStore = create<State & Actions>()(
  persist(
    (set) => ({
      savedDashboardView: "listView",
      savedPhotoView: "photoGridView",
      savedPhotoGroupBy: "room",
      // savedPhotoSort: "createdAt",
      updatePreference: (preference) =>
        set((state) => ({ ...state, ...preference })),
    }),

    {
      name: "userPreference",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
