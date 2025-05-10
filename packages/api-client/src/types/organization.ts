import { User } from "./auth";

export interface Organization {
  id: string;
  name: string;
  phoneNumber?: string;
  formattedAddress?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  faxNumber?: string;
  size?: number;
  logo?: string;
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
  subscriptionId?: string;
  subscriptionPlan?: string;
  customerId?: string;
  maxUsersForSubscription?: number;
  freeTrialEndsAt?: Date;
  subscriptionStatus?: string;
}

export interface OrganizationMembership {
  id: string;
  role:
    | "ADMIN"
    | "MEMBER"
    | "PROJECT_MANAGER"
    | "ACCOUNT_MANAGER"
    | "CONTRACTOR"
    | "OWNER";
  status: "PENDING" | "ACTIVE" | "REJECTED";
  organization: Organization;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDto {
  name: string;
  phoneNumber?: string;
  formattedAddress?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;

  faxNumber?: string;
  size?: number;
  logo?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

export interface InviteMemberDto {
  email: string;
  role?: "ADMIN" | "MEMBER";
}
