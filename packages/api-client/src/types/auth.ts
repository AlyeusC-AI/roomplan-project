import { OrganizationMembership } from "./organization";

export interface User {
  id: string;
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
  avatar: string | null;
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
  phone?: string;
  //   lead?: string;
  acceptReminders: boolean;
  referralSource?: string;
}

export interface RequestPasswordResetCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  password: string;
}
