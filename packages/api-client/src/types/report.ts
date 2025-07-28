export enum ReportStatus {
  PENDING = "PENDING",
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum ReportType {
  PROJECT_SUMMARY = "PROJECT_SUMMARY",
  EQUIPMENT = "EQUIPMENT",
  MOISTURE_READINGS = "MOISTURE_READINGS",
  ROOM_DETAILS = "ROOM_DETAILS",
  MATERIAL_ANALYSIS = "MATERIAL_ANALYSIS",
  COST_BREAKDOWN = "COST_BREAKDOWN",
  CUSTOM = "CUSTOM",
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  status: ReportStatus;
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
  projectId: string;
  createdById: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateReportRequest {
  name: string;
  description?: string;
  type?: ReportType;
  projectId: string;
}

export interface UpdateReportRequest {
  name?: string;
  description?: string;
  type?: ReportType;
  projectId?: string;
}
