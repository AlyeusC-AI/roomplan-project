import type {
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentProject,
  AssignEquipmentDto,
} from "../types/equipment";
import { apiClient } from "./client";

class EquipmentService {
  async create(data: CreateEquipmentDto & { organizationId: string }) {
    return apiClient.post<Equipment>("/equipment", data);
  }

  async findAll(organizationId: string) {
    return apiClient.get<Equipment[]>(
      `/equipment/organization/${organizationId}`
    );
  }

  async findOne(id: string) {
    return apiClient.get<Equipment>(`/equipment/${id}`);
  }

  async update(id: string, data: UpdateEquipmentDto) {
    return apiClient.patch<Equipment>(`/equipment/${id}`, data);
  }

  async remove(id: string) {
    return apiClient.delete<Equipment>(`/equipment/${id}`);
  }

  async assignEquipment(data: AssignEquipmentDto) {
    return apiClient.post<EquipmentProject>("/equipment/assign", data);
  }

  async getEquipmentAssignments(projectId: string) {
    return apiClient.get<EquipmentProject[]>(
      `/equipment/project/${projectId}/assignments`
    );
  }

  async removeEquipmentAssignment(id: string) {
    return apiClient.delete<EquipmentProject>(`/equipment/assignment/${id}`);
  }
}

export const equipmentService = new EquipmentService();
