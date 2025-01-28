import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface State {
  user: User | null;
}

interface Actions {
  setUser: (user: User) => void;
}

export const userInfoStore = create<State & Actions>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User | null) => set(() => ({ user })),
    }),
    {
      name: "userInfo",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
