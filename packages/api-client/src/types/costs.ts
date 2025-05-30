export interface Cost {
  id: string;
  name: string;
  estimatedCost?: number;
  actualCost?: number;
  type: CostType;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export enum CostType {
  LABOR = "LABOR",
  MATERIAL = "MATERIAL",
  MISCELLANEOUS = "MISCELLANEOUS",
  SUBCONTRACTOR = "SUBCONTRACTOR",
}

export interface CreateCostDto {
  name: string;
  estimatedCost?: number;
  actualCost?: number;
  type: CostType;
  projectId: string;
}

export interface UpdateCostDto {
  name?: string;
  estimatedCost?: number;
  actualCost?: number;
  type?: CostType;
}
