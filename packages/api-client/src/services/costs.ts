import type { Cost, CreateCostDto, UpdateCostDto } from "../types/costs";
import { apiClient } from "./client";

class CostsService {
  async create(data: CreateCostDto) {
    return apiClient.post<Cost>("/costs", data);
  }

  async findAll(projectId: string) {
    return apiClient.get<Cost[]>(`/costs/project/${projectId}`);
  }

  async findOne(id: string) {
    return apiClient.get<Cost>(`/costs/${id}`);
  }

  async update(id: string, data: UpdateCostDto) {
    return apiClient.patch<Cost>(`/costs/${id}`, data);
  }

  async remove(id: string) {
    return apiClient.delete<Cost>(`/costs/${id}`);
  }
}

export const costsService = new CostsService();
