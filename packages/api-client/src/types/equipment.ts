export interface Equipment {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  image?: string;
  organizationId: string;
  categoryId: string;
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
  roomId?: string;
  equipment?: Equipment;
  room?: {
    id: string;
    name: string;
  };
}

export interface CreateEquipmentDto {
  name: string;
  description?: string;
  quantity: number;
  image?: string;
  categoryId: string;
}

export interface UpdateEquipmentDto {
  name?: string;
  description?: string;
  quantity?: number;
  image?: string;
  categoryId?: string;
}

export interface AssignEquipmentDto {
  equipmentId: string;
  projectId: string;
  quantity: number;
  roomId?: string;
}
