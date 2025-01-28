import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  organization: Organization | null;
}

interface Actions {
  setOrganization: (organization: Organization) => void;
}

export const orgStore = create<State & Actions>()(
  persist(
    (set) => ({
      organization: null,
      setOrganization: (organization) => set(() => ({ organization })),
    }),
    {
      name: "orgInfo",
    }
  )
);
