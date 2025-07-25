import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { equipmentService } from "../services/equipment";
import type {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  Equipment,
  EquipmentProject,
  AssignEquipmentDto,
} from "../types/equipment";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: CreateEquipmentDto) =>
      equipmentService.create({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentDto }) =>
      equipmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useGetEquipment({ categoryId }: { categoryId?: string }) {
  const org = useActiveOrganization();
  const options: UseQueryOptions<Equipment[], Error> = {
    queryKey: ["equipment", org?.id, categoryId],
    queryFn: async () => {
      const response = await equipmentService.findAll(
        org?.id ?? "",
        categoryId
      );
      return response.data;
    },
    enabled: !!org?.id && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetEquipmentById(id: string) {
  return useQuery({
    queryKey: ["equipment", id],
    queryFn: () => equipmentService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
  });
}

export function useAssignEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignEquipmentDto) =>
      equipmentService.assignEquipment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["equipment-assignments", variables.projectId],
      });
    },
  });
}

export function useGetEquipmentAssignments(projectId: string) {
  return useQuery({
    queryKey: ["equipment-assignments", projectId],
    queryFn: () => equipmentService.getEquipmentAssignments(projectId),
    enabled: !!projectId && !!useAuthStore.getState().token,
  });
}

export function useRemoveEquipmentAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentService.removeEquipmentAssignment(id),
    onSuccess: (_, variables) => {
      // Invalidate all equipment assignments queries since we don't know the projectId
      queryClient.invalidateQueries({ queryKey: ["equipment-assignments"] });
    },
  });
}

export function useUpdateEquipmentAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "PLACED" | "ACTIVE" | "REMOVED";
    }) => equipmentService.updateEquipmentAssignmentStatus(id, status),
    onSuccess: (_, variables) => {
      // Invalidate all equipment assignments queries since we don't know the projectId
      queryClient.invalidateQueries({ queryKey: ["equipment-assignments"] });
    },
  });
}

export function useGetEquipmentHistory(equipmentId: string) {
  return useQuery({
    queryKey: ["equipment-history", equipmentId],
    queryFn: () => equipmentService.getEquipmentHistory(equipmentId),
    enabled: !!equipmentId && !!useAuthStore.getState().token,
  });
}
