import { apiClient } from "./client";
import {
  Report,
  CreateReportRequest,
  UpdateReportRequest,
} from "../types/report";

class ReportsService {
  async create(data: CreateReportRequest): Promise<Report> {
    const response = await apiClient.post<Report>("/reports", data);
    return response.data;
  }

  async findAll(projectId: string): Promise<Report[]> {
    const response = await apiClient.get<Report[]>(
      `/reports/project/${projectId}`
    );
    return response.data;
  }

  async findOne(id: string): Promise<Report> {
    const response = await apiClient.get<Report>(`/reports/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateReportRequest): Promise<Report> {
    const response = await apiClient.patch<Report>(`/reports/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  }

  async generatePDF(id: string): Promise<Blob> {
    const response = await apiClient.post<Blob>(
      `/reports/${id}/generate-pdf`,
      {},
      {
        responseType: "blob",
      }
    );
    return response.data;
  }
}

export const reportsService = new ReportsService();
