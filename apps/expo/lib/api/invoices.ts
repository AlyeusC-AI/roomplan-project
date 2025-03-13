import { Invoice, InvoiceItem } from "@/lib/state/invoices";
import { userStore } from "@/lib/state/user";

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

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const { session } = userStore.getState();
  return session?.access_token || null;
};

/**
 * Fetch all invoices, optionally filtered by status
 */
export async function fetchInvoices(status?: string): Promise<ApiResponse<Invoice[]>> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { error: "Not authenticated" };
    }

    const url = status 
      ? `${BASE_URL}/api/v1/invoices?status=${encodeURIComponent(status)}`
      : `${BASE_URL}/api/v1/invoices`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token
      }
    });
    
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
    const token = getAuthToken();
    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/api/v1/invoices/${encodeURIComponent(publicId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token
      }
    });
    
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
    const token = getAuthToken();
    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": token
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
    const token = getAuthToken();
    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/api/v1/invoices/${encodeURIComponent(publicId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": token
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
    const token = getAuthToken();
    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/api/v1/invoices/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        "auth-token": token
      }
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
    const token = getAuthToken();
    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/api/v1/invoices/${encodeURIComponent(publicId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": token
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
 * Fetch invoices by project ID
 */
export async function fetchInvoicesByProject(projectPublicId: string): Promise<ApiResponse<Invoice[]>> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${BASE_URL}/api/v1/projects/${encodeURIComponent(projectPublicId)}/invoices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token
      }
    });
    
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