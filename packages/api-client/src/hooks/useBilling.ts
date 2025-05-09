import { useMutation, useQuery } from "@tanstack/react-query";
import { billingService } from "../services/billing";
import type {
  SubscriptionPlan,
  CheckoutSessionResponse,
  CreateCheckoutSessionParams,
} from "../types/billing";

export function useCreateCheckoutSession() {
  return useMutation<
    CheckoutSessionResponse,
    Error,
    CreateCheckoutSessionParams
  >({
    mutationFn: (params) => billingService.createCheckoutSession(params),
  });
}

export function useCreatePortalSession() {
  return useMutation<CheckoutSessionResponse, Error, string>({
    mutationFn: (organizationId) =>
      billingService.createPortalSession(organizationId),
  });
}

export function useGetSubscriptionPlans() {
  return useQuery<SubscriptionPlan[], Error>({
    queryKey: ["subscription-plans"],
    queryFn: () => billingService.getSubscriptionPlans(),
  });
}
