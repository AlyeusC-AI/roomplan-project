import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { estimateService } from "../services/estimate";
import type {
  CreateEstimateDto,
  UpdateEstimateDto,
  Estimate,
} from "../types/estimate";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateEstimate() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: CreateEstimateDto) =>
      estimateService.create({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });
}

export function useUpdateEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEstimateDto }) =>
      estimateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });
}

export function useGetEstimates() {
  const org = useActiveOrganization();
  const options: UseQueryOptions<Estimate[], Error> = {
    queryKey: ["estimates", org?.id],
    queryFn: async () => {
      const response = await estimateService.findAll(org?.id ?? "");
      return response.data;
    },
    enabled: !!org?.id && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetEstimateById(id: string) {
  return useQuery({
    queryKey: ["estimates", id],
    queryFn: () => estimateService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estimateService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });
}

export function useGetEstimatesByProject(projectId: string) {
  return useQuery({
    queryKey: ["estimates", "project", projectId],
    queryFn: () => estimateService.findByProject(projectId),
    enabled: !!projectId && !!useAuthStore.getState().token,
  });
}

export function useUpdateEstimateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
    }) => estimateService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
    },
  });
}

export function useConvertEstimateToInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estimateService.convertToInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useEmailEstimate() {
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      estimateService.emailEstimate(id, message),
  });
}
