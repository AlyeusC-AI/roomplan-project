export interface Equipment {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  image?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentProject {
  id: string;
  equipmentId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  roomId: string;
}

export interface CreateEquipmentDto {
  name: string;
  description?: string;
  quantity: number;
  image?: string;
}

export interface UpdateEquipmentDto {
  name?: string;
  description?: string;
  quantity?: number;
  image?: string;
}
