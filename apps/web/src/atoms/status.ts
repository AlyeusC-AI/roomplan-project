import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  statuses: Status[];
}

interface Actions {
  setStatuses: (project: Status[]) => void;
  getStatuses(): Promise<Status[]>;
}

export const statusStore = create<State & Actions>()(
  
    (set, get) => ({
      statuses: [],
      setStatuses: (statuses) => set(() => ({ statuses })),
      async getStatuses() {
        if (get().statuses.length > 0) {
          return get().statuses;
        }
        const res = await fetch("/api/v1/projects/statuses");
        const json: Status[] = await res.json();

        set(() => ({
          statuses: json.sort((a: Status, b: Status) => (a.order || 0) - (b.order || 0)),
        }));

        return json;
      },
  })
);
