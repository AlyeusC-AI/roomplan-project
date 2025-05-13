import { apiClient } from "./client";
import type {
  CreateProjectDto,
  UpdateProjectDto,
  Project,
} from "../types/project";
import type { PaginationParams, PaginatedResponse } from "../types/common";

export const projectService = {
  create: (data: CreateProjectDto & { organizationId: string }) =>
    apiClient.post<Project>("/projects", data),

  findAll: (organizationId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Project>>(
      `/projects/organization/${organizationId}`,
      {
        params,
      }
    ),

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
};
