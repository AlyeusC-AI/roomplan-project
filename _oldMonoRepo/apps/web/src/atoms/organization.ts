import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  organization: Organization | null;
}

interface Actions {
  setOrganization(): Promise<Organization>;
  setOrganizationLocal(organization: Organization): void;
}

export const orgStore = create<State & Actions>()(
  persist(
    (set) => ({
      organization: null,
      setOrganization: async () => {
        const res = await fetch("/api/v1/organization");
        const json = await res.json();

        set(() => ({ organization: json }));

        return json
      },
      setOrganizationLocal: (organization) => {
        set(() => ({ organization }));
      },
    }),
    {
      name: "orgInfo",
    }
  )
);
