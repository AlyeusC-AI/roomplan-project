export enum ReportStatus {
  PENDING = "PENDING",
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Report {
  id: string;
  name: string;
  description?: string;
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
  projectId: string;
}

export interface UpdateReportRequest {
  name?: string;
  description?: string;
  projectId?: string;
}
