import type {
  Tag,
  CreateTagDto,
  UpdateTagDto,
  TagFilters,
  SetTagsDto,
  BulkUpsertTagsDto,
  TagStats,
  ProjectWithTags,
  ImageWithTags,
} from "../types/tags";
import { apiClient } from "./client";
import { useAuthStore } from "./storage";

class TagsService {
  // Basic CRUD operations
  async create(
    data: Omit<CreateTagDto, "organizationId"> & { organizationId: string }
  ) {
    return apiClient.post<Tag>("/tags", data);
  }

  async findAll(
    organizationId: string,
    filters?: Omit<TagFilters, "organizationId">
  ) {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);
    params.append("organizationId", organizationId);

    return apiClient.get<Tag[]>(`/tags?${params.toString()}`);
  }

  async findOne(id: string) {
    return apiClient.get<Tag>(`/tags/${id}`);
  }

  async update(id: string, data: UpdateTagDto) {
    return apiClient.put<Tag>(`/tags/${id}`, data);
  }

  async delete(id: string) {
    return apiClient.delete<Tag>(`/tags/${id}`);
  }

  // Project tag operations
  async setProjectTags(
    projectId: string,
    data: Omit<SetTagsDto, "organizationId"> & { organizationId: string }
  ) {
    return apiClient.post<ProjectWithTags>(
      `/tags/projects/${projectId}/set`,
      data
    );
  }

  async addProjectTags(
    projectId: string,
    data: Omit<SetTagsDto, "organizationId"> & { organizationId: string }
  ) {
    return apiClient.post<ProjectWithTags>(
      `/tags/projects/${projectId}/add`,
      data
    );
  }

  async removeProjectTags(
    projectId: string,
    data: Omit<SetTagsDto, "organizationId"> & { organizationId: string }
  ) {
    return apiClient.delete<ProjectWithTags>(
      `/tags/projects/${projectId}/remove`,
      { data }
    );
  }

  // Image tag operations
  async setImageTags(
    imageId: string,
    data: Omit<SetTagsDto, "organizationId"> & { organizationId: string }
  ) {
    return apiClient.post<ImageWithTags>(`/tags/images/${imageId}/set`, data);
  }

  async addImageTags(
    imageId: string,
    data: Omit<SetTagsDto, "organizationId"> & { organizationId: string }
  ) {
    return apiClient.post<ImageWithTags>(`/tags/images/${imageId}/add`, data);
  }

  async removeImageTags(
    imageId: string,
    data: Omit<SetTagsDto, "organizationId"> & { organizationId: string }
  ) {
    return apiClient.delete<ImageWithTags>(`/tags/images/${imageId}/remove`, {
      data,
    });
  }

  // Bulk operations
  async bulkUpsertTags(
    data: Omit<BulkUpsertTagsDto, "tags"> & {
      tags: Array<
        Omit<BulkUpsertTagsDto["tags"][0], "organizationId"> & {
          organizationId: string;
        }
      >;
    }
  ) {
    return apiClient.post<Tag[]>("/tags/bulk", data);
  }

  // Statistics
  async getTagStats(organizationId: string) {
    return apiClient.get<TagStats>(`/tags/stats/${organizationId}`);
  }
}

export const tagsService = new TagsService();
