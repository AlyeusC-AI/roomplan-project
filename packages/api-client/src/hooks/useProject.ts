import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { projectService } from "../services/project";
import type {
  CreateProjectDto,
  UpdateProjectDto,
  Project,
} from "../types/project";
import type { PaginationParams, PaginatedResponse } from "../types/common";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateProject() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: CreateProjectDto) =>
      projectService.create({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      projectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

interface UseGetProjectsOptions {
  pagination?: PaginationParams;
  enabled?: boolean;
}

export function useGetProjects(options: UseGetProjectsOptions = {}) {
  const org = useActiveOrganization();
  const { pagination, enabled = true } = options;

  const queryOptions: UseQueryOptions<PaginatedResponse<Project>, Error> = {
    queryKey: ["projects", org?.id, pagination],
    queryFn: async () => {
      const response = await projectService.findAll(org?.id ?? "", pagination);
      return response.data;
    },
    enabled: enabled && !!org?.id && !!useAuthStore.getState().token,
    notifyOnChangeProps: "all",
  };

  return useQuery(queryOptions);
}

export function useGetProjectById(id: string) {
  const { data: projects } = useGetProjects();

  const a = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectService.findOne(id),
    enabled: !!id,
  });

  const project = projects?.data?.find((p) => p.id === id);

  return {
    ...a,
    data: a.data ?? (project ? { data: project } : undefined),
  };
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export const useGetProjectsByStatus = (
  statusId: string,
  options?: {
    pagination?: PaginationParams;
    enabled?: boolean;
  }
) => {
  const org = useActiveOrganization();
  return useQuery({
    queryKey: ["projects", "status", org?.id, statusId, options?.pagination],
    queryFn: () =>
      projectService.findAllByStatus(
        org?.id ?? "",
        statusId,
        options?.pagination
      ),
    enabled: options?.enabled ?? true,
  });
};

// Add project member hooks
export function useGetProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "members"],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => projectService.addProjectMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId],
      });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => projectService.removeProjectMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId],
      });
    },
  });
}
