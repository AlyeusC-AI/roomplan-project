import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { costsService } from "../services/costs";
import type { CreateCostDto, UpdateCostDto, Cost } from "../types/costs";
import { useAuthStore } from "../services/storage";

export function useCreateCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCostDto) => costsService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["costs", variables.projectId],
      });
    },
  });
}

export function useUpdateCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostDto }) =>
      costsService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate all costs queries since we don't know the projectId
      queryClient.invalidateQueries({ queryKey: ["costs"] });
    },
  });
}

export function useGetCosts(projectId: string) {
  const options: UseQueryOptions<Cost[], Error> = {
    queryKey: ["costs", projectId],
    queryFn: async () => {
      const response = await costsService.findAll(projectId);
      return response.data;
    },
    enabled: !!projectId && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetCostById(id: string) {
  return useQuery({
    queryKey: ["costs", id],
    queryFn: () => costsService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => costsService.remove(id),
    onSuccess: () => {
      // Invalidate all costs queries since we don't know the projectId
      queryClient.invalidateQueries({ queryKey: ["costs"] });
    },
  });
}
