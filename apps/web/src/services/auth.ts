import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    useAuthStore.getState().setToken(data.token);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      credentials
    );
    useAuthStore.getState().setToken(data.token);
    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await axiosInstance.get<{ message: string }>(
      `/auth/verify-email?token=${token}`
    );
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await axiosInstance.get<User>("/auth/me");
      return data;
    } catch (error) {
      return null;
    }
  },

  logout() {
    useAuthStore.getState().clearToken();
  },
};
