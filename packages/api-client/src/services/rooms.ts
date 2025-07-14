import type {
  Room,
  CreateRoomDto,
  UpdateRoomDto,
  Image,
  Comment,
  ImageFilters,
  ImageSortOptions,
  PaginationOptions,
  ImageStats,
  AddImageDto,
  AddCommentDto,
  AreaAffected,
  RoomAreaAffected,
  ImageType,
} from "../types/room";
import { apiClient } from "./client";

class RoomsService {
  async create(data: CreateRoomDto): Promise<Room> {
    const response = await apiClient.post<Room>("/rooms", data);
    return response.data;
  }

  async findAll(projectId: string): Promise<Room[]> {
    const response = await apiClient.get<Room[]>(`/rooms/project/${projectId}`);
    return response.data;
  }

  async findOne(id: string): Promise<Room> {
    const response = await apiClient.get<Room>(`/rooms/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    const response = await apiClient.put<Room>(`/rooms/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<Room> {
    const response = await apiClient.delete<Room>(`/rooms/${id}`);
    return response.data;
  }

  // Image related endpoints
  async addImage(data: AddImageDto): Promise<Image> {
    const response = await apiClient.post<Image>(`/rooms/images`, data);
    return response.data;
  }

  async removeImage(imageId: string): Promise<Image> {
    const response = await apiClient.delete<Image>(`/rooms/images/${imageId}`);
    return response.data;
  }

  async updateImage(
    imageId: string,
    data: {
      url?: string;
      showInReport?: boolean;
      order?: number;
      name?: string;
      description?: string;
      type?: ImageType;
    }
  ): Promise<Image> {
    const response = await apiClient.put<Image>(
      `/rooms/images/${imageId}`,
      data
    );
    return response.data;
  }

  async searchImages(
    projectId: string,
    filters: ImageFilters,
    sort: ImageSortOptions,
    pagination: PaginationOptions
  ): Promise<{
    data: Image[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      ...(filters.showInReport !== undefined && {
        showInReport: String(filters.showInReport),
      }),
      ...(filters.hasComments !== undefined && {
        hasComments: String(filters.hasComments),
      }),
      ...(filters.createdAfter && { createdAfter: filters.createdAfter }),
      ...(filters.createdBefore && { createdBefore: filters.createdBefore }),
      ...(filters.roomIds?.length && { roomIds: filters.roomIds.join(",") }),
      ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
      ...(filters.type && { type: filters.type }),
      ...(filters.tagNames?.length && { tagNames: filters.tagNames.join(",") }),
      sortField: sort.field,
      sortDirection: sort.direction,
      page: String(pagination.page || 1),
      limit: String(pagination.limit || 20),
    });

    const response = await apiClient.get(
      `/rooms/project/${projectId}/images/search?${params.toString()}`
    );
    return response.data;
  }

  async getImageStats(projectId: string): Promise<ImageStats> {
    const response = await apiClient.get<ImageStats>(
      `/rooms/project/${projectId}/images/stats`
    );
    return response.data;
  }

  async bulkUpdateImages(
    projectId: string,
    filters: Omit<ImageFilters, "projectId">,
    updates: { showInReport?: boolean; order?: number }
  ): Promise<{ count: number }> {
    const requestData: any = {
      filters: {
        ...filters,
        projectId,
      },
      updates,
    };

    // Convert tagNames array to comma-separated string for backend
    if (filters.tagNames && Array.isArray(filters.tagNames)) {
      requestData.filters.tagNames = filters.tagNames.join(",");
    }

    const response = await apiClient.patch(
      `/rooms/project/${projectId}/images/bulk-update`,
      requestData
    );
    return response.data;
  }

  async bulkRemoveImages(
    projectId: string,
    filters: Omit<ImageFilters, "projectId">
  ): Promise<{ count: number }> {
    const requestData: any = {
      filters: {
        ...filters,
        projectId,
      },
    };

    // Convert tagNames array to comma-separated string for backend
    if (filters.tagNames && Array.isArray(filters.tagNames)) {
      requestData.filters.tagNames = filters.tagNames.join(",");
    }

    const response = await apiClient.delete(
      `/rooms/project/${projectId}/images/bulk-remove`,
      {
        data: requestData,
      }
    );
    return response.data;
  }

  async updateImagesOrder(
    updates: { id: string; order: number }[]
  ): Promise<{ count: number }> {
    const response = await apiClient.patch(`/rooms/images/order`, updates);
    return response.data;
  }

  // Comment related endpoints
  async addComment(imageId: string, data: AddCommentDto): Promise<Comment> {
    const response = await apiClient.post<Comment>(
      `/rooms/images/${imageId}/comments`,
      data
    );
    return response.data;
  }

  async removeComment(commentId: string): Promise<Comment> {
    const response = await apiClient.delete<Comment>(
      `/rooms/comments/${commentId}`
    );
    return response.data;
  }

  async getComments(imageId: string): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(
      `/rooms/images/${imageId}/comments`
    );
    return response.data;
  }

  // Area Affected methods
  async updateAreaAffected(
    roomId: string,
    type: "floor" | "walls" | "ceiling",
    data: {
      material?: string;
      totalAreaRemoved?: string;
      totalAreaMicrobialApplied?: string;
      cabinetryRemoved?: string;
      isVisible?: boolean;
      extraFields?: any;
    }
  ): Promise<RoomAreaAffected> {
    const response = await apiClient.patch<RoomAreaAffected>(
      `/rooms/${roomId}/area-affected/${type}`,
      data
    );
    return response.data;
  }

  async deleteAreaAffected(
    roomId: string,
    type: "floor" | "walls" | "ceiling"
  ): Promise<RoomAreaAffected> {
    const response = await apiClient.delete<RoomAreaAffected>(
      `/rooms/${roomId}/area-affected/${type}`
    );
    return response.data;
  }

  async getAreaAffected(roomId: string): Promise<RoomAreaAffected> {
    const response = await apiClient.get<RoomAreaAffected>(
      `/rooms/${roomId}/area-affected`
    );
    return response.data;
  }

  // Copilot Progress
  async getCopilotProgress(roomId: string) {
    const response = await apiClient.get<{ copilotProgress: any }>(
      `/rooms/${roomId}/copilot-progress`
    );
    return response.data;
  }
  async updateCopilotProgress(roomId: string, copilotProgress: any) {
    const response = await apiClient.patch<{ copilotProgress: any }>(
      `/rooms/${roomId}/copilot-progress`,
      { copilotProgress }
    );
    return response.data;
  }
}

export const roomsService = new RoomsService();
