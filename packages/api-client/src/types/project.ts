import { ProjectStatus } from "./projectStatus";
import { Tag } from "./tags";

export enum LossType {
  FIRE = "FIRE",
  WATER = "WATER",
  WIND = "WIND",
  HAIL = "HAIL",
  MOLD = "MOLD",
  OTHER = "OTHER",
}

export interface ProjectImage {
  id: string;
  url: string;
  name?: string;
  description?: string;
  createdAt: Date;
  roomId?: string;
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
  tags?: Tag[];
  images?: ProjectImage[];
  _count?: {
    images: number;
    documents: number;
  };
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

export interface FilterProjectsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  startDate?: string;
  endDate?: string;
  assigneeIds?: string[];
  tagNames?: string[];
}

export interface SendLidarEmailRequest {
  roomId: string;
  roomPlanSVG: string;
}

export interface SendLidarEmailResponse {
  success: boolean;
  message: string;
}
