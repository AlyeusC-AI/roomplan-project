import type {
  SubscriptionPlan,
  CheckoutSessionResponse,
  CreateCheckoutSessionParams,
  SubscriptionInfo,
  UpdateUsersResponse,
} from "../types/billing";
import { apiClient } from "./client";

export const billingService = {
  createCheckoutSession: (params: CreateCheckoutSessionParams) =>
    apiClient
      .post<CheckoutSessionResponse>(
        `/billing/organizations/${params.organizationId}/checkout`,
        params
      )
      .then((res) => res.data),

  createPortalSession: (organizationId: string) =>
    apiClient
      .post<CheckoutSessionResponse>(
        `/billing/organizations/${organizationId}/portal`
      )
      .then((res) => res.data),

  getSubscriptionPlans: () =>
    apiClient.get<SubscriptionPlan[]>("/billing/plans").then((res) => res.data),

  getSubscriptionInfo: (organizationId: string) =>
    apiClient
      .get<SubscriptionInfo>(
        `/billing/organizations/${organizationId}/subscription`
      )
      .then((res) => res.data),

  updateAdditionalUsers: (organizationId: string, additionalUsers: number) =>
    apiClient
      .post<UpdateUsersResponse>(
        `/billing/organizations/${organizationId}/users`,
        {
          additionalUsers,
        }
      )
      .then((res) => res.data),
};
