import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserState = {
  user: any;
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: any) => void;
  clearSession: () => void;
};

export const userStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      setSession: (session) =>
        set((state) => ({
          session,
          isAuthenticated: !!session,
          user: session?.user || state.user,
        })),
      setUser: (user) => set({ user }),
      clearSession: () => set({ session: null, isAuthenticated: false, user: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ session: state.session, user: state.user }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
