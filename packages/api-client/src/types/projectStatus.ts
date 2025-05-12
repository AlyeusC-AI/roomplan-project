export interface ProjectStatus {
  id: string;
  label: string;
  description?: string;
  color?: string;
  isDefault: boolean;
  order: number;
  organizationId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectStatusDto {
  label: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  order?: number;
}

export interface UpdateProjectStatusDto {
  label?: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  order?: number;
}

export interface ReorderProjectStatusDto {
  statusIds: string[];
}
