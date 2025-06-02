import type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceResponse,
  InvoicesResponse,
  SaveInvoiceItemDto,
  InvoiceItem,
  SavedLineItemsExportResponse,
  SavedLineItemsImportResponse,
  SavedLineItemsByCategoryResponse,
} from "../types/invoice";
import { apiClient } from "./client";

class InvoiceService {
  async create(data: CreateInvoiceDto) {
    return apiClient.post<Invoice>("/invoices", data);
  }

  async findAll(organizationId: string) {
    return apiClient.get<Invoice[]>(`/invoices/organization/${organizationId}`);
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
    return apiClient.get<SavedLineItemsExportResponse>(url);
  }

  async importSavedLineItemsFromCsv(organizationId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<SavedLineItemsImportResponse>(
      `/invoices/items/saved/import/${organizationId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }
}

export const invoiceService = new InvoiceService();
