import type {
  ProjectStatus,
  CreateProjectStatusDto,
  UpdateProjectStatusDto,
  ReorderProjectStatusDto,
} from "../types/projectStatus";
import { useActiveOrganization } from "../hooks/useOrganization";
import { apiClient } from "./client";
import { useOrganizationStore } from "./organization";

class ProjectStatusService {
  async create(data: CreateProjectStatusDto & { organizationId: string }) {
    const response = await apiClient.post<ProjectStatus>(
      "/project-status",
      data
    );
    return response;
  }

  async findAll(organizationId: string) {
    const response = await apiClient.get<ProjectStatus[]>(
      `/project-status/organization/${organizationId}`
    );
    return response;
  }

  async findOne(id: string) {
    const response = await apiClient.get<ProjectStatus>(
      `/project-status/${id}`
    );
    return response;
  }

  async update(id: string, data: UpdateProjectStatusDto) {
    const response = await apiClient.patch<ProjectStatus>(
      `/project-status/${id}`,
      data
    );
    return response;
  }

  async remove(id: string) {
    const response = await apiClient.delete<ProjectStatus>(
      `/project-status/${id}`
    );
    return response;
  }

  async reorder(data: ReorderProjectStatusDto) {
    const response = await apiClient.post<ProjectStatus[]>(
      `/project-status/organization/${useOrganizationStore.getState().activeOrganization}/reorder`,
      data
    );
    return response;
  }
}

export const projectStatusService = new ProjectStatusService();
