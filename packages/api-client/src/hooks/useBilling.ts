import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingService } from "../services/billing";
import type {
  SubscriptionPlan,
  CheckoutSessionResponse,
  CreateCheckoutSessionParams,
  SubscriptionInfo,
  UpdateUsersResponse,
} from "../types/billing";
import { useActiveOrganization } from "./useOrganization";

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

export function useGetSubscriptionInfo() {
  const org = useActiveOrganization();
  return useQuery<SubscriptionInfo, Error>({
    queryKey: ["subscription-info", org?.id],
    queryFn: () => billingService.getSubscriptionInfo(org?.id || ""),
    enabled: !!org?.id,
  });
}

export function useUpdateAdditionalUsers() {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateUsersResponse,
    Error,
    { organizationId: string; additionalUsers: number }
  >({
    mutationFn: ({ organizationId, additionalUsers }) =>
      billingService.updateAdditionalUsers(organizationId, additionalUsers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-info"] });
    },
  });
}
