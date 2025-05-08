import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { cookies } from "next/headers";

export interface Organization {
  id: string;
  name: string;
  phoneNumber: string | null;
  address: string | null;
  faxNumber: string | null;
  size: number | null;
  isDeleted: boolean;
  logo: string | null;
  lat: number | null;
  lng: number | null;
  subscriptionId: string | null;
  subscriptionPlan: string | null;
  customerId: string | null;
  maxUsersForSubscription: number | null;
  freeTrialEndsAt: Date | null;
  subscriptionStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
  supabaseId: string | null;
}
export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status: string;
  invitedAt: Date;
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organization: Organization;
}

export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  referralCode: string | null;
  referralSource: string | null;
  acceptReminders: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  supabaseId: string | null;
  organizationMemberships: OrganizationMembership[];
}

export interface AuthResponse {
  access_token: string;
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

export interface RequestPasswordResetCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    // Store token in client-side store
    useAuthStore.getState().setToken(data.access_token);

    // Store token in HTTP-only cookie via API route
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.access_token }),
    });

    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      credentials
    );
    // Store token in client-side store
    useAuthStore.getState().setToken(data.access_token);

    // Store token in HTTP-only cookie via API route
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.access_token }),
    });

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

  async logout() {
    try {
      // Call backend logout endpoint to clear the token
      await axiosInstance.post("/auth/logout");

      // Clear client-side store
      useAuthStore.getState().clearToken();

      // Clear the HTTP-only cookie via API route
      await fetch("/api/auth", { method: "DELETE" });
    } catch (error) {
      console.error("Error during logout:", error);
      // Still clear local state even if backend call fails
      useAuthStore.getState().clearToken();
      await fetch("/api/auth", { method: "DELETE" });
    }
  },

  async requestPasswordReset(
    credentials: RequestPasswordResetCredentials
  ): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      "/auth/request-password-reset",
      credentials
    );
    return data;
  },

  async resetPassword(
    token: string,
    credentials: ResetPasswordCredentials
  ): Promise<{ message: string }> {
    const { data } = await axiosInstance.post<{ message: string }>(
      `/auth/reset-password?token=${token}`,
      credentials
    );
    return data;
  },
};
