import { Invoice, InvoiceItem } from "@/atoms/invoices";

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
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
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
export async function fetchInvoices(status?: string): Promise<ApiResponse<Invoice[]>> {
  try {
    const url = status 
      ? `/api/v1/invoices?status=${encodeURIComponent(status)}`
      : '/api/v1/invoices';
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch invoices');
    }
    
    const data = await response.json();
    return { data: data.invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Fetch a single invoice by its public ID
 */
export async function fetchInvoiceById(publicId: string): Promise<ApiResponse<Invoice>> {
  try {
    const response = await fetch(`/api/v1/invoices/${encodeURIComponent(publicId)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch invoice');
    }
    
    const data = await response.json();
    return { data: data.invoice };
  } catch (error) {
    console.error(`Error fetching invoice ${publicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Create a new invoice
 */
export async function createInvoice(data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
  try {
    const response = await fetch('/api/v1/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create invoice');
    }
    
    const responseData = await response.json();
    return { data: responseData.invoice };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(publicId: string, updates: Partial<CreateInvoiceRequest['invoice']>): Promise<ApiResponse<Invoice>> {
  try {
    const response = await fetch(`/api/v1/invoices/${encodeURIComponent(publicId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoice: updates }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update invoice');
    }
    
    const data = await response.json();
    return { data: data.invoice };
  } catch (error) {
    console.error(`Error updating invoice ${publicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Delete an invoice (soft delete)
 */
export async function deleteInvoice(publicId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`/api/v1/invoices/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete invoice');
    }
    
    return { data: { success: true } };
  } catch (error) {
    console.error(`Error deleting invoice ${publicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  publicId: string, 
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
): Promise<ApiResponse<Invoice>> {
  try {
    const response = await fetch(`/api/v1/invoices/${encodeURIComponent(publicId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update invoice status');
    }
    
    const data = await response.json();
    return { data: data.invoice };
  } catch (error) {
    console.error(`Error updating invoice status for ${publicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Add an item to an invoice
 */
export async function addInvoiceItem(
  invoicePublicId: string, 
  item: Omit<InvoiceItem, 'id'>
): Promise<ApiResponse<InvoiceItem>> {
  try {
    const response = await fetch(`/api/v1/invoices/${encodeURIComponent(invoicePublicId)}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add invoice item');
    }
    
    const data = await response.json();
    return { data: data.item };
  } catch (error) {
    console.error(`Error adding item to invoice ${invoicePublicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
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
    const response = await fetch(`/api/v1/invoices/items/${encodeURIComponent(itemPublicId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update invoice item');
    }
    
    const data = await response.json();
    return { data: data.item };
  } catch (error) {
    console.error(`Error updating invoice item ${itemPublicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Delete an invoice item
 */
export async function deleteInvoiceItem(itemPublicId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`/api/v1/invoices/items/${encodeURIComponent(itemPublicId)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete invoice item');
    }
    
    return { data: { success: true } };
  } catch (error) {
    console.error(`Error deleting invoice item ${itemPublicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Fetch invoices for a specific project
 */
export async function fetchInvoicesByProject(projectPublicId: string): Promise<ApiResponse<Invoice[]>> {
  try {
    const response = await fetch(`/api/v1/projects/${encodeURIComponent(projectPublicId)}/invoices`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch project invoices');
    }
    
    const data = await response.json();
    return { data: data.invoices };
  } catch (error) {
    console.error(`Error fetching invoices for project ${projectPublicId}:`, error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
} 