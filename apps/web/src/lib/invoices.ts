import { apiClient } from "./api-client";

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

/**
 * Calculate invoice totals based on line items
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxRate = 0,
  markupPercentage = 0,
  discountAmount = 0
) {
  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  // Calculate markup
  const markup = subtotal * (markupPercentage / 100);

  // Calculate pre-tax total
  const preTaxTotal = subtotal + markup - discountAmount;

  // Calculate tax
  const tax = preTaxTotal * (taxRate / 100);

  // Calculate final total
  const total = preTaxTotal + tax;

  return {
    subtotal,
    markup,
    tax,
    total,
    discountAmount,
  };
}

/**
 * Fetch all invoices, optionally filtered by status
 */
export async function fetchInvoices(status?: string): Promise<Invoice[]> {
  try {
    const endpoint = status
      ? `/invoices?status=${encodeURIComponent(status)}`
      : "/invoices";

    const data = await apiClient(endpoint);

    if (data.error) {
      throw new Error(data.error);
    }

    return data.invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

/**
 * Fetch a single invoice by its public ID
 */
export async function fetchInvoiceById(publicId: string): Promise<Invoice> {
  try {
    const data = await apiClient(`/invoices/${encodeURIComponent(publicId)}`);
    return data.invoice;
  } catch (error) {
    console.error(`Error fetching invoice ${publicId}:`, error);
    throw error;
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  data: CreateInvoiceRequest
): Promise<Invoice> {
  try {
    const result = await apiClient("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  publicId: string,
  updates: Partial<CreateInvoiceRequest["invoice"]>
): Promise<Invoice> {
  try {
    const result = await apiClient(
      `/invoices/${encodeURIComponent(publicId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ invoice: updates }),
      }
    );
    return result.invoice;
  } catch (error) {
    console.error(`Error updating invoice ${publicId}:`, error);
    throw error;
  }
}

/**
 * Delete an invoice (soft delete)
 */
export async function deleteInvoice(
  publicId: string
): Promise<{ success: boolean }> {
  try {
    await apiClient(`/invoices/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error) {
    console.error(`Error deleting invoice ${publicId}:`, error);
    throw error;
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  publicId: string,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
): Promise<Invoice> {
  try {
    const result = await apiClient(
      `/invoices/${encodeURIComponent(publicId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
    return result.invoice;
  } catch (error) {
    console.error(`Error updating invoice status for ${publicId}:`, error);
    throw error;
  }
}

/**
 * Fetch invoices by project ID
 */
export async function fetchInvoicesByProject(
  projectPublicId: string
): Promise<Invoice[]> {
  try {
    const result = await apiClient(
      `/projects/${encodeURIComponent(projectPublicId)}/invoices`
    );
    return result.invoices;
  } catch (error) {
    console.error(
      `Error fetching invoices for project ${projectPublicId}:`,
      error
    );
    throw error;
  }
}
