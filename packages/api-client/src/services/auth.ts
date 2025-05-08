import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RequestPasswordResetCredentials,
  ResetPasswordCredentials,
  User,
} from "../types/auth";

// Platform detection
const isWeb = typeof window !== "undefined";
const isReactNative = !isWeb;

// Storage implementation
const getStorage = () => {
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

const client = createClient({
  getToken: () => tokenStorage.getToken(),
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await client.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    await tokenStorage.setToken(data.access_token);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await client.post<AuthResponse>(
      "/auth/register",
      credentials
    );
    await tokenStorage.setToken(data.access_token);
    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await client.get<{ message: string }>(
      `/auth/verify-email?token=${token}`
    );
    return data;
  },

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const { data } = await client.post<{ message: string }>(
      "/auth/resend-verification",
      { email }
    );
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await client.get<User>("/auth/me");
      return data;
    } catch (error) {
      return null;
    }
  },

  async logout() {
    try {
      await client.post("/auth/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      await tokenStorage.clearToken();
    }
  },

  async requestPasswordReset(
    credentials: RequestPasswordResetCredentials
  ): Promise<{ message: string }> {
    const { data } = await client.post<{ message: string }>(
      "/auth/request-password-reset",
      credentials
    );
    return data;
  },

  async resetPassword(
    token: string,
    credentials: ResetPasswordCredentials
  ): Promise<{ message: string }> {
    const { data } = await client.post<{ message: string }>(
      `/auth/reset-password?token=${token}`,
      credentials
    );
    return data;
  },
};
