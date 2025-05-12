import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { projectStatusService } from "../services/projectStatus";
import type {
  CreateProjectStatusDto,
  UpdateProjectStatusDto,
  ProjectStatus,
  ReorderProjectStatusDto,
} from "../types/projectStatus";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateProjectStatus() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: CreateProjectStatusDto) =>
      projectStatusService.create({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectStatuses"] });
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectStatusDto }) =>
      projectStatusService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectStatuses"] });
    },
  });
}

export function useGetProjectStatuses() {
  const org = useActiveOrganization();
  const options: UseQueryOptions<ProjectStatus[], Error> = {
    queryKey: ["projectStatuses", org?.id],
    queryFn: async () => {
      const response = await projectStatusService.findAll(org?.id ?? "");
      return response.data;
    },
    enabled: !!org?.id && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetProjectStatus(id: string) {
  return useQuery({
    queryKey: ["projectStatuses", id],
    queryFn: () => projectStatusService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectStatusService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectStatuses"] });
    },
  });
}

export function useReorderProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderProjectStatusDto) =>
      projectStatusService.reorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectStatuses"] });
    },
  });
}
