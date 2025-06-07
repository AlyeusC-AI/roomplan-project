import { apiClient as client } from "./client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RequestPasswordResetCredentials,
  ResetPasswordCredentials,
  User,
} from "../types/auth";
import { useAuthStore } from "./storage";

const tokenStorage = useAuthStore.getState();

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

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }): Promise<User> {
    const { data: userData } = await client.put<User>("/auth/profile", data);
    return userData;
  },
};
