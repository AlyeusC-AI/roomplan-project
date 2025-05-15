import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Platform detection
const isReactNative =
  typeof navigator !== "undefined" && navigator.product === "ReactNative";
const isWeb = !isReactNative;

// Storage implementation
const getStorage = () => {
  console.log("🚀 ~ getStorage ~ isReactNative:", isReactNative);

  if (isWeb && typeof localStorage !== "undefined") {
    return localStorage;
  }
  if (isReactNative) {
    return AsyncStorage;
  }
  // Fallback to memory storage if neither is available
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => getStorage()),
      //   skipHydration: true, // Important for Next.js to prevent hydration mismatch
    }
  )
);

// Platform-specific token storage
export interface TokenStorage {
  setToken: (token: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  clearToken: () => Promise<void>;
}

// Default implementation that can be overridden by platforms
let tokenStorage: TokenStorage = {
  setToken: async (token) => {
    useAuthStore.getState().setToken(token);
  },
  getToken: async () => {
    const token = useAuthStore.getState().token;
    console.log("🚀 ~ getToken: ~ token:", token);

    return token;
  },
  clearToken: async () => {
    useAuthStore.getState().clearToken();
  },
};

export const setTokenStorage = (storage: TokenStorage) => {
  tokenStorage = storage;
};
