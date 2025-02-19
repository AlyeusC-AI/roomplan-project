import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface State {
  user: (User & { imageUrl: string }) | null;
}

interface Actions {
  setUser: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
}

export const userInfoStore = create<State & Actions>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User | null) =>
        set(() => ({
          user:
            user === null
              ? null
              : {
                  ...user,
                  imageUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${user.id}/avatar.png`,
                },
        })),
      updateUser: (user) =>
        set((state) => ({
          user: {
            ...state.user!,
            ...user,
          },
        })),
    }),
    {
      name: "userInfo",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
