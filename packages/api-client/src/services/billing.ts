import { apiClient as client } from "./client";
import type {
  SubscriptionPlan,
  CheckoutSessionResponse,
  CreateCheckoutSessionParams,
} from "../types/billing";

export const billingService = {
  createCheckoutSession: async (params: CreateCheckoutSessionParams) => {
    const response = await client.post<CheckoutSessionResponse>(
      `/billing/organizations/${params.organizationId}/checkout`,
      {
        priceId: params.priceId,
        type: params.type,
        plan: params.plan,
        noTrial: params.noTrial,
      }
    );
    return response.data;
  },

  createPortalSession: async (organizationId: string) => {
    const response = await client.post<CheckoutSessionResponse>(
      `/billing/organizations/${organizationId}/portal`
    );
    return response.data;
  },

  getSubscriptionPlans: async () => {
    const response = await client.get<SubscriptionPlan[]>("/billing/plans");
    return response.data;
  },
};
