import type {
  Estimate,
  CreateEstimateDto,
  UpdateEstimateDto,
  EstimateResponse,
  EstimatesResponse,
  ConversionResponse,
} from "../types/estimate";
import { apiClient } from "./client";

class EstimateService {
  async create(data: CreateEstimateDto & { organizationId: string }) {
    return apiClient.post<Estimate>("/estimates", data);
  }

  async findAll(organizationId: string) {
    return apiClient.get<Estimate[]>(
      `/estimates/organization/${organizationId}`
    );
  }

  async findOne(id: string) {
    return apiClient.get<Estimate>(`/estimates/${id}`);
  }

  async update(id: string, data: UpdateEstimateDto) {
    return apiClient.patch<Estimate>(`/estimates/${id}`, data);
  }

  async remove(id: string) {
    return apiClient.delete<Estimate>(`/estimates/${id}`);
  }

  async findByProject(projectId: string) {
    return apiClient.get<Estimate[]>(`/estimates/project/${projectId}`);
  }

  async updateStatus(
    id: string,
    status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED"
  ) {
    return apiClient.patch<Estimate>(`/estimates/${id}/status`, { status });
  }

  async convertToInvoice(id: string) {
    return apiClient.post<{ estimate: Estimate; invoiceId: string }>(
      `/estimates/${id}/convert`
    );
  }

  async emailEstimate(id: string, message?: string) {
    return apiClient.post<{ success: boolean; message: string }>(
      `/estimates/${id}/email`,
      {
        message,
      }
    );
  }
}

export const estimateService = new EstimateService();
