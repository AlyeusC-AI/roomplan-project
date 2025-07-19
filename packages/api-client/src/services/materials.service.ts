import { apiClient } from "./client";
import type {
  Material,
  CreateMaterialDto,
  UpdateMaterialDto,
  DryStandardMaterial,
  ProjectMaterial,
  CreateProjectMaterialDto,
  UpdateProjectMaterialDto,
  DryGoalCompliance,
} from "../types/material";

export const materialsService = {
  // Get all materials
  async getAll(): Promise<Material[]> {
    const response = await apiClient.get<Material[]>("/materials");
    return response.data;
  },

  // Get a single material by ID
  async getById(id: string): Promise<Material> {
    const response = await apiClient.get<Material>(`/materials/${id}`);
    return response.data;
  },

  // Create a new material
  async create(data: CreateMaterialDto): Promise<Material> {
    const response = await apiClient.post<Material>("/materials", data);
    return response.data;
  },

  // Update an existing material
  async update(id: string, data: UpdateMaterialDto): Promise<Material> {
    const response = await apiClient.put<Material>(`/materials/${id}`, data);
    return response.data;
  },

  // Delete a material
  async delete(id: string): Promise<Material> {
    const response = await apiClient.delete<Material>(`/materials/${id}`);
    return response.data;
  },

  // Get materials that meet dry standard requirements
  async getDryStandardMaterials(): Promise<DryStandardMaterial[]> {
    const materials = await this.getAll();
    return materials
      .map((material) => ({
        ...material,
        isDryStandardCompliant: material.variance <= 15,
      }))
      .filter((material) => material.isDryStandardCompliant);
  },

  // Check if a material meets dry standard
  async checkDryStandardCompliance(materialId: string): Promise<boolean> {
    const material = await this.getById(materialId);
    return material.variance <= 15; // Dry standard threshold
  },

  // Get materials with dry standard compliance info
  async getMaterialsWithCompliance(): Promise<DryStandardMaterial[]> {
    const materials = await this.getAll();
    return materials.map((material) => ({
      ...material,
      isDryStandardCompliant: material.variance <= 15,
    }));
  },

  // Project Material Methods
  async createProjectMaterial(
    data: CreateProjectMaterialDto
  ): Promise<ProjectMaterial> {
    const response = await apiClient.post<ProjectMaterial>(
      "/materials/project",
      data
    );
    return response.data;
  },

  async getProjectMaterials(projectId: string): Promise<ProjectMaterial[]> {
    const response = await apiClient.get<ProjectMaterial[]>(
      `/materials/project/${projectId}`
    );
    return response.data;
  },

  async getProjectMaterial(id: string): Promise<ProjectMaterial> {
    const response = await apiClient.get<ProjectMaterial>(
      `/materials/project-material/${id}`
    );
    return response.data;
  },

  async updateProjectMaterial(
    id: string,
    data: UpdateProjectMaterialDto
  ): Promise<ProjectMaterial> {
    const response = await apiClient.put<ProjectMaterial>(
      `/materials/project-material/${id}`,
      data
    );
    return response.data;
  },

  async deleteProjectMaterial(id: string): Promise<ProjectMaterial> {
    const response = await apiClient.delete<ProjectMaterial>(
      `/materials/project-material/${id}`
    );
    return response.data;
  },

  async checkDryGoalCompliance(id: string): Promise<DryGoalCompliance> {
    const response = await apiClient.get<DryGoalCompliance>(
      `/materials/project-material/${id}/dry-goal-compliance`
    );
    return response.data;
  },

  async calculateDryGoal(
    materialId: string,
    initialMoisture: number
  ): Promise<number> {
    const response = await apiClient.get<number>(
      `/materials/calculate-dry-goal/${materialId}/${initialMoisture}`
    );
    return response.data;
  },
};
