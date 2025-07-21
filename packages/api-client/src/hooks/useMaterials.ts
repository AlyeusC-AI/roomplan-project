import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialsService } from "../services/materials.service";
import type {
  Material,
  CreateMaterialDto,
  UpdateMaterialDto,
  DryStandardMaterial,
  ProjectMaterial,
  CreateProjectMaterialDto,
  UpdateProjectMaterialDto,
  DryGoalCompliance,
} from "../types/material";

// Query keys
export const materialKeys = {
  all: ["materials"] as const,
  lists: () => [...materialKeys.all, "list"] as const,
  list: (filters: string) => [...materialKeys.lists(), { filters }] as const,
  details: () => [...materialKeys.all, "detail"] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  dryStandard: () => [...materialKeys.all, "dryStandard"] as const,
  projectMaterials: () => [...materialKeys.all, "projectMaterials"] as const,
  projectMaterial: (projectId: string) =>
    [...materialKeys.projectMaterials(), projectId] as const,
  projectMaterialDetail: (id: string) =>
    [...materialKeys.all, "projectMaterial", id] as const,
};

// Get all materials
export const useGetMaterials = () => {
  return useQuery({
    queryKey: materialKeys.lists(),
    queryFn: materialsService.getAll,
  });
};

// Get a single material
export const useGetMaterial = (id: string) => {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => materialsService.getById(id),
    enabled: !!id,
  });
};

// Get dry standard materials
export const useGetDryStandardMaterials = () => {
  return useQuery({
    queryKey: materialKeys.dryStandard(),
    queryFn: materialsService.getDryStandardMaterials,
  });
};

// Get materials with compliance info
export const useGetMaterialsWithCompliance = () => {
  return useQuery({
    queryKey: [...materialKeys.lists(), "compliance"],
    queryFn: materialsService.getMaterialsWithCompliance,
  });
};

// Create material
export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.dryStandard() });
    },
  });
};

// Update material
export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialDto }) =>
      materialsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: materialKeys.dryStandard() });
    },
  });
};

// Delete material
export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.dryStandard() });
    },
  });
};

// Check dry standard compliance
export const useCheckDryStandardCompliance = (materialId: string) => {
  return useQuery({
    queryKey: [...materialKeys.detail(materialId), "compliance"],
    queryFn: () => materialsService.checkDryStandardCompliance(materialId),
    enabled: !!materialId,
  });
};

// Project Material Hooks
export const useGetProjectMaterials = (projectId: string) => {
  return useQuery({
    queryKey: materialKeys.projectMaterial(projectId),
    queryFn: () => materialsService.getProjectMaterials(projectId),
    enabled: !!projectId,
  });
};

export const useGetProjectMaterial = (id: string) => {
  return useQuery({
    queryKey: materialKeys.projectMaterialDetail(id),
    queryFn: () => materialsService.getProjectMaterial(id),
    enabled: !!id,
  });
};

export const useCreateProjectMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsService.createProjectMaterial,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: materialKeys.projectMaterial(variables.projectId),
      });
    },
  });
};

export const useUpdateProjectMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProjectMaterialDto;
    }) => materialsService.updateProjectMaterial(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: materialKeys.projectMaterialDetail(id),
      });
    },
  });
};

export const useDeleteProjectMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsService.deleteProjectMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materialKeys.projectMaterials(),
      });
    },
  });
};

export const useCheckDryGoalCompliance = (id: string) => {
  return useQuery({
    queryKey: [...materialKeys.projectMaterialDetail(id), "dryGoalCompliance"],
    queryFn: () => materialsService.checkDryGoalCompliance(id),
    enabled: !!id,
  });
};
