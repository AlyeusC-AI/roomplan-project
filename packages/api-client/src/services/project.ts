import { apiClient } from "./client";
import type {
  CreateProjectDto,
  UpdateProjectDto,
  Project,
  SendLidarEmailRequest,
  SendLidarEmailResponse,
} from "../types/project";
import type { PaginationParams, PaginatedResponse } from "../types/common";
import type { User } from "../types/auth";

export const projectService = {
  create: (data: CreateProjectDto & { organizationId: string }) =>
    apiClient.post<Project>("/projects", data),

  findAll: (organizationId: string, params?: PaginationParams) => {
    const queryParams: any = { ...params };

    // Convert tagNames array to comma-separated string for backend
    if (params?.tagNames && Array.isArray(params.tagNames)) {
      queryParams.tagNames = params.tagNames.join(",");
    }

    return apiClient.get<PaginatedResponse<Project>>(
      `/projects/organization/${organizationId}`,
      {
        params: queryParams,
      }
    );
  },

  findOne: (id: string) => apiClient.get<Project>(`/projects/${id}`),

  update: (id: string, data: UpdateProjectDto) =>
    apiClient.patch<Project>(`/projects/${id}`, data),

  remove: (id: string) => apiClient.delete<Project>(`/projects/${id}`),

  findAllByStatus: async (
    organizationId: string,
    statusId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<PaginatedResponse<Project>>(
      `/projects/organization/${organizationId}/status/${statusId}`,
      { params }
    );
    return response.data;
  },

  // Project Members Management
  getProjectMembers: async (projectId: string): Promise<{ users: User[] }> => {
    const response = await apiClient.get<{ users: User[] }>(
      `/projects/${projectId}/member`
    );
    return response.data;
  },

  addProjectMember: async (projectId: string, userId: string) => {
    const response = await apiClient.post(`/projects/${projectId}/member`, {
      userId,
    });
    return response.data;
  },

  removeProjectMember: async (projectId: string, userId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}/member`, {
      data: { userId },
    });
    return response.data;
  },

  // Lidar Email
  sendLidarEmail: async (
    projectId: string,
    data: SendLidarEmailRequest
  ): Promise<SendLidarEmailResponse> => {
    const response = await apiClient.post<SendLidarEmailResponse>(
      `/projects/${projectId}/lidar/email`,
      data
    );
    return response.data;
  },
};
