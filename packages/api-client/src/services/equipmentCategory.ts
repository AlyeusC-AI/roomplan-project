import { apiClient } from "./client";

export interface EquipmentCategory {
  id: string;
  name: string;
  organizationId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

class EquipmentCategoryService {
  async findAll(organizationId: string) {
    return apiClient.get<EquipmentCategory[]>(
      `/equipment-categories/organization/${organizationId}`
    );
  }
  async create(data: { name: string; organizationId: string }) {
    return apiClient.post<EquipmentCategory>("/equipment-categories", data);
  }
  async update(id: string, data: { name: string }) {
    return apiClient.put<EquipmentCategory>(
      `/equipment-categories/${id}`,
      data
    );
  }
  async remove(id: string) {
    return apiClient.delete<EquipmentCategory>(`/equipment-categories/${id}`);
  }
}

export const equipmentCategoryService = new EquipmentCategoryService();
