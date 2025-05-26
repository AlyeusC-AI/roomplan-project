import { ProjectStatus } from "./projectStatus";

export enum LossType {
  FIRE = "FIRE",
  WATER = "WATER",
  WIND = "WIND",
  HAIL = "HAIL",
  MOLD = "MOLD",
  OTHER = "OTHER",
}

export interface Project {
  id: string;
  name: string;
  supabaseId?: string;
  description?: string;
  adjusterEmail?: string;
  adjusterPhoneNumber?: string;
  clientEmail?: string;
  clientPhoneNumber?: string;
  clientName?: string;
  adjusterName?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  assignmentNumber?: string;
  companyName?: string;
  managerName?: string;
  insuranceCompanyName?: string;
  insuranceClaimId?: string;
  lossType?: LossType;
  catCode?: string;
  humidity?: string;
  temperature?: string;
  wind?: string;
  lat?: string;
  lng?: string;
  forecast?: string;
  claimSummary?: string;
  roofSegments?: string[];
  roofSpecs?: string;
  rcvValue?: string;
  actualValue?: string;
  statusId?: string;
  mainImage?: string;
  policyNumber?: string;
  dateOfLoss?: Date;
  organizationId: string;
  status: ProjectStatus;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  adjusterEmail?: string;
  adjusterPhoneNumber?: string;
  clientEmail?: string;
  clientPhoneNumber?: string;
  clientName?: string;
  adjusterName?: string;
  location?: string;
  assignmentNumber?: string;
  companyName?: string;
  managerName?: string;
  insuranceCompanyName?: string;
  insuranceClaimId?: string;
  lossType?: LossType;
  catCode?: string;
  humidity?: string;
  temperature?: string;
  wind?: string;
  lat?: string;
  lng?: string;
  forecast?: string;
  claimSummary?: string;
  roofSegments?: string[];
  roofSpecs?: string;
  rcvValue?: string;
  actualValue?: string;
  statusId?: string;
  mainImage?: string;
  policyNumber?: string;
  dateOfLoss?: Date;
}

export type UpdateProjectDto = Partial<CreateProjectDto>;
