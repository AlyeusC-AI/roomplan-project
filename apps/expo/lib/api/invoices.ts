import { Invoice, InvoiceItem } from "@/lib/state/invoices";
import { apiClient } from './client';

// Interface for API requests
interface CreateInvoiceRequest {
  invoice: {
    number: string;
    clientName: string;
    clientEmail?: string;
    projectPublicId?: string;
    poNumber?: string;
    invoiceDate: string;
    dueDate: string;
    subtotal: number;
    discount?: number;
    markup?: number;
    tax?: number;
    total: number;
    deposit?: number;
    status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
    notes?: string;
    terms?: string;
  };
  invoiceItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    notes?: string;
  }>;
  paymentSchedules?: Array<{
    dueDate: string;
    amount: number;
    description?: string;
  }>;
}

// Interface for API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Fetch all invoices, optionally filtered by status
 */
export async function fetchInvoices(
  status?: string
): Promise<ApiResponse<Invoice[]>> {
  try {
    const url = status
      ? `/api/v1/invoices?status=${encodeURIComponent(status)}`
      : "/api/v1/invoices";

    const response = await apiClient(url);
    
    return { data: response.invoices };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Fetch a single invoice by its public ID
 */
export async function fetchInvoiceById(
  publicId: string
): Promise<ApiResponse<Invoice>> {
  try {
    const response = await apiClient(
      `/api/v1/invoices/${encodeURIComponent(publicId)}`
    );
    
    return { data: response.invoice };
  } catch (error) {
    console.error(`Error fetching invoice ${publicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  data: CreateInvoiceRequest
): Promise<ApiResponse<Invoice>> {
  try {
    const response = await apiClient("/api/v1/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return { data: response.invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  publicId: string,
  updates: Partial<CreateInvoiceRequest["invoice"]>
): Promise<ApiResponse<Invoice>> {
  try {
    const response = await apiClient(
      `/api/v1/invoices/${encodeURIComponent(publicId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ invoice: updates }),
      }
    );

    return { data: response.invoice };
  } catch (error) {
    console.error(`Error updating invoice ${publicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Delete an invoice (soft delete)
 */
export async function deleteInvoice(
  publicId: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    await apiClient(
      `/api/v1/invoices/${encodeURIComponent(publicId)}`,
      {
        method: "DELETE",
      }
    );

    return { data: { success: true } };
  } catch (error) {
    console.error(`Error deleting invoice ${publicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  publicId: string,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
): Promise<ApiResponse<Invoice>> {
  try {
    const response = await apiClient(
      `/api/v1/invoices/${encodeURIComponent(publicId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );

    return { data: response.invoice };
  } catch (error) {
    console.error(`Error updating invoice status for ${publicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Add an item to an invoice
 */
export async function addInvoiceItem(
  invoicePublicId: string,
  item: Omit<InvoiceItem, "id">
): Promise<ApiResponse<InvoiceItem>> {
  try {
    const response = await apiClient(
      `/api/v1/invoices/${encodeURIComponent(invoicePublicId)}/items`,
      {
        method: "POST",
        body: JSON.stringify(item),
      }
    );

    return { data: response.item };
  } catch (error) {
    console.error(`Error adding item to invoice ${invoicePublicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Update an invoice item
 */
export async function updateInvoiceItem(
  itemPublicId: string,
  updates: Partial<InvoiceItem>
): Promise<ApiResponse<InvoiceItem>> {
  try {
    const response = await apiClient(
      `/api/v1/invoice-items/${encodeURIComponent(itemPublicId)}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );

    return { data: response.item };
  } catch (error) {
    console.error(`Error updating invoice item ${itemPublicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Delete an invoice item
 */
export async function deleteInvoiceItem(
  itemPublicId: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    await apiClient(
      `/api/v1/invoice-items/${encodeURIComponent(itemPublicId)}`,
      {
        method: "DELETE",
      }
    );

    return { data: { success: true } };
  } catch (error) {
    console.error(`Error deleting invoice item ${itemPublicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Fetch invoices by project ID
 */
export async function fetchInvoicesByProject(
  projectPublicId: string
): Promise<ApiResponse<Invoice[]>> {
  try {
    const response = await apiClient(
      `/api/v1/projects/${encodeURIComponent(projectPublicId)}/invoices`
    );
    
    return { data: response.invoices };
  } catch (error) {
    console.error(`Error fetching invoices for project ${projectPublicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Email an invoice to the client
 */
export async function emailInvoice(
  publicId: string,
  message?: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await apiClient(
      `/api/v1/invoices/${encodeURIComponent(publicId)}/email`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    );

    return { 
      data: { 
        success: true, 
        message: response.message || "Invoice sent successfully" 
      } 
    };
  } catch (error) {
    console.error(`Error emailing invoice ${publicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
} 