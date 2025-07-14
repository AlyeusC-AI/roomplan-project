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
  SendLidarEmailRequest,
  SendLidarEmailResponse,
  FilterProjectsParams,
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
  pagination?: FilterProjectsParams;
  enabled?: boolean;
  tagNames?: string[];
  startDate?: string;
  endDate?: string;
  assigneeIds?: string[];
}

export function useGetProjects(options: UseGetProjectsOptions = {}) {
  const org = useActiveOrganization();
  const {
    pagination,
    enabled = true,
    tagNames,
    startDate,
    endDate,
    assigneeIds,
  } = options;

  const queryOptions: UseQueryOptions<PaginatedResponse<Project>, Error> = {
    queryKey: [
      "projects",
      org?.id,
      pagination,
      tagNames,
      startDate,
      endDate,
      assigneeIds,
    ],
    queryFn: async () => {
      const response = await projectService.findAll(org?.id ?? "", {
        ...pagination,
        tagNames,
        startDate,
        endDate,
        assigneeIds,
      });
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
    pagination?: FilterProjectsParams;
    enabled?: boolean;
    tagNames?: string[];
    startDate?: string;
    endDate?: string;
    assigneeIds?: string[];
  }
) => {
  const org = useActiveOrganization();
  return useQuery({
    queryKey: [
      "projects",
      "status",
      org?.id,
      statusId,
      options?.pagination,
      options?.tagNames,
      options?.startDate,
      options?.endDate,
      options?.assigneeIds,
    ],
    queryFn: () =>
      projectService.findAllByStatus(org?.id ?? "", statusId, {
        ...options?.pagination,
        tagNames: options?.tagNames,
        startDate: options?.startDate,
        endDate: options?.endDate,
        assigneeIds: options?.assigneeIds,
      }),
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

export function useSendLidarEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: SendLidarEmailRequest;
    }) => projectService.sendLidarEmail(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

export function useGetProjectCopilotProgress(projectId: string) {
  return useQuery({
    queryKey: ["projectCopilotProgress", projectId],
    queryFn: () => projectService.getCopilotProgress(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateProjectCopilotProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      copilotProgress,
    }: {
      projectId: string;
      copilotProgress: any;
    }) => projectService.updateCopilotProgress(projectId, copilotProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectCopilotProgress", variables.projectId],
      });
    },
  });
}
