// import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTokenStorage } from "@service-geek/api-client";

type Session = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  true_token?: string;
  user?: any;
};

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
          session: {
            ...session,
            access_token:
              session?.true_token ||
              state.session?.true_token ||
              session?.access_token,
          },
          isAuthenticated: !!session,
          user: session?.user || state.user,
        })),
      setUser: (user) => set({ user }),
      clearSession: () =>
        set({ session: null, isAuthenticated: false, user: null }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ session: state.session, user: state.user }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
