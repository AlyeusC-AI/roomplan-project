export interface Material {
  id: string;
  name: string;
  description?: string;
  image?: string;
  variance: number;
  isDefault: boolean;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaterialDto {
  name: string;
  description?: string;
  image?: string;
  variance: number;
}

export interface UpdateMaterialDto {
  name?: string;
  description?: string;
  image?: string;
  variance?: number;
}

// Dry standard specific types
export interface DryStandardMaterial extends Material {
  isDryStandardCompliant: boolean;
}

export interface DryStandardCompliance {
  materialId: string;
  materialName: string;
  variance: number;
  isCompliant: boolean;
  threshold: number; // Typically 15% for dry standard
}

// Project Material Types
export interface ProjectMaterial {
  id: string;
  projectId: string;
  materialId: string;
  material: Material;
  project: any; // Project type
  customVariance?: number;
  moistureContent?: number;
  dryGoal?: number;
  isDryStandardCompliant: boolean;
  wallReadings: any[]; // WallReading type
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectMaterialDto {
  projectId: string;
  materialId: string;
  customVariance?: number;
  moistureContent?: number;
  dryGoal?: number;
}

export interface UpdateProjectMaterialDto {
  customVariance?: number;
  moistureContent?: number;
  dryGoal?: number;
}

export interface DryGoalCompliance {
  isCompliant: boolean;
  currentMoisture: number;
  dryGoal: number;
  difference: number;
}
