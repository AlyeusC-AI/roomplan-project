import type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceResponse,
  InvoicesResponse,
  SaveInvoiceItemDto,
  UpdateSavedLineItemDto,
  InvoiceItem,
  SavedLineItemsExportResponse,
  SavedLineItemsImportResponse,
  SavedLineItemsByCategoryResponse,
  PaginatedInvoicesResponse,
} from "../types/invoice";
import { apiClient } from "./client";

class InvoiceService {
  async create(data: CreateInvoiceDto) {
    return apiClient.post<Invoice>("/invoices", data);
  }

  async findAll(
    organizationId: string,
    page?: number,
    limit?: number,
    search?: string
  ) {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (search) params.append("search", search);

    const queryString = params.toString();
    const url = `/invoices/organization/${organizationId}${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<PaginatedInvoicesResponse>(url);
  }

  async findOne(id: string) {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  }

  async update(id: string, data: UpdateInvoiceDto) {
    return apiClient.patch<Invoice>(`/invoices/${id}`, data);
  }

  async remove(id: string) {
    return apiClient.delete<Invoice>(`/invoices/${id}`);
  }

  async findByProject(projectId: string) {
    return apiClient.get<Invoice[]>(`/invoices/project/${projectId}`);
  }

  async updateStatus(
    id: string,
    status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
  ) {
    return apiClient.patch<Invoice>(`/invoices/${id}/status`, { status });
  }

  async emailInvoice(id: string, message?: string) {
    return apiClient.post<{ success: boolean; message: string }>(
      `/invoices/${id}/email`,
      {
        message,
      }
    );
  }

  async saveInvoiceItem(data: SaveInvoiceItemDto) {
    return apiClient.post<InvoiceItem>("/invoices/items/save", data);
  }

  async getSavedInvoiceItems(organizationId: string) {
    return apiClient.get<InvoiceItem[]>(
      `/invoices/items/saved/${organizationId}`
    );
  }

  async getSavedLineItemsByCategory(organizationId: string, category: string) {
    return apiClient.get<SavedLineItemsByCategoryResponse>(
      `/invoices/items/saved/category/${category}/${organizationId}`
    );
  }

  async exportSavedLineItemsToCsv(organizationId: string, category?: string) {
    const url = category
      ? `/invoices/items/saved/export/${organizationId}?category=${encodeURIComponent(category)}`
      : `/invoices/items/saved/export/${organizationId}`;
    const response = await apiClient.get<SavedLineItemsExportResponse>(url);
    return response.data;
  }

  async importSavedLineItemsFromCsv(organizationId: string, fileUrl: string) {
    return apiClient.post<SavedLineItemsImportResponse>(
      `/invoices/items/saved/import/${organizationId}`,
      { fileUrl }
    );
  }

  async downloadCsvFile(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to download CSV file");
    }
    return response.blob();
  }

  async updateSavedLineItem(id: string, data: UpdateSavedLineItemDto) {
    return apiClient.patch<InvoiceItem>(`/invoices/items/saved/${id}`, data);
  }

  async deleteSavedLineItem(id: string) {
    return apiClient.delete<InvoiceItem>(`/invoices/items/saved/${id}`);
  }
}

export const invoiceService = new InvoiceService();
