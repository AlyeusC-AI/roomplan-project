export interface Organization {
  id: string;
  name: string;
  phoneNumber?: string;
  address?: string;
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
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "ACTIVE" | "REJECTED";
  organization: Organization;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDto {
  name: string;
  phoneNumber?: string;
  address?: string;
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
