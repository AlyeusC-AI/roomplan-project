import type {
  Chamber,
  CreateChamberDto,
  UpdateChamberDto,
} from "../types/chamber";
import { apiClient } from "./client";

class ChamberService {
  async create(data: CreateChamberDto): Promise<Chamber> {
    const response = await apiClient.post<Chamber>("/chambers", data);
    return response.data;
  }

  async findAll(projectId: string): Promise<Chamber[]> {
    const response = await apiClient.get<Chamber[]>(
      `/chambers/project/${projectId}`
    );
    return response.data;
  }

  async findOne(id: string): Promise<Chamber> {
    const response = await apiClient.get<Chamber>(`/chambers/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateChamberDto): Promise<Chamber> {
    const response = await apiClient.put<Chamber>(`/chambers/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<Chamber> {
    const response = await apiClient.delete<Chamber>(`/chambers/${id}`);
    return response.data;
  }
}

export const chamberService = new ChamberService();
