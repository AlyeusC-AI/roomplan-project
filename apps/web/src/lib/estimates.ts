import { apiClient } from "./api-client";

export interface Estimate {
  id?: number;
  publicId: string;
  number: string;
  clientName: string;
  clientEmail?: string;
  projectPublicId?: string;
  estimateDate: string;
  expiryDate: string;
  subtotal: number;
  discount?: number;
  markup?: number;
  tax?: number;
  total: number;
  deposit?: number;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  notes?: string;
  terms?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EstimateItem {
  id?: number;
  estimateId?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
}

interface CreateEstimateRequest {
  estimate: Omit<Estimate, "id" | "publicId">;
  estimateItems: Array<Omit<EstimateItem, "id">>;
  paymentSchedules?: Array<{
    dueDate: string;
    amount: number;
    description?: string;
  }>;
}

/**
 * Fetch all estimates, optionally filtered by status
 */
export async function fetchEstimates(status?: string): Promise<Estimate[]> {
  try {
    const endpoint = status
      ? `/estimates?status=${encodeURIComponent(status)}`
      : "/estimates";

    const data = await apiClient(endpoint);
    return data.estimates;
  } catch (error) {
    console.error("Error fetching estimates:", error);
    throw error;
  }
}

/**
 * Fetch a single estimate by its public ID
 */
export async function fetchEstimateById(publicId: string): Promise<Estimate> {
  try {
    const data = await apiClient(`/estimates/${encodeURIComponent(publicId)}`);
    return data.estimate;
  } catch (error) {
    console.error(`Error fetching estimate ${publicId}:`, error);
    throw error;
  }
}

/**
 * Create a new estimate
 */
export async function createEstimate(
  data: CreateEstimateRequest
): Promise<Estimate> {
  try {
    const result = await apiClient("/estimates", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.estimate;
  } catch (error) {
    console.error("Error creating estimate:", error);
    throw error;
  }
}

/**
 * Update an existing estimate
 */
export async function updateEstimate(
  publicId: string,
  updates: Partial<Estimate>
): Promise<Estimate> {
  try {
    const result = await apiClient(
      `/estimates/${encodeURIComponent(publicId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ estimate: updates }),
      }
    );
    return result.estimate;
  } catch (error) {
    console.error(`Error updating estimate ${publicId}:`, error);
    throw error;
  }
}

/**
 * Delete an estimate (soft delete)
 */
export async function deleteEstimate(
  publicId: string
): Promise<{ success: boolean }> {
  try {
    await apiClient(`/estimates/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error) {
    console.error(`Error deleting estimate ${publicId}:`, error);
    throw error;
  }
}

/**
 * Update estimate status
 */
export async function updateEstimateStatus(
  publicId: string,
  status: "draft" | "sent" | "accepted" | "declined" | "expired"
): Promise<Estimate> {
  try {
    const result = await apiClient(
      `/estimates/${encodeURIComponent(publicId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
    return result.estimate;
  } catch (error) {
    console.error(`Error updating estimate status for ${publicId}:`, error);
    throw error;
  }
}

/**
 * Fetch estimates by project ID
 */
export async function fetchEstimatesByProject(
  projectPublicId: string
): Promise<Estimate[]> {
  try {
    const result = await apiClient(
      `/projects/${encodeURIComponent(projectPublicId)}/estimates`
    );
    return result.estimates;
  } catch (error) {
    console.error(
      `Error fetching estimates for project ${projectPublicId}:`,
      error
    );
    throw error;
  }
}

/**
 * Convert estimate to invoice
 */
export async function convertEstimateToInvoice(
  estimatePublicId: string
): Promise<{ invoicePublicId: string }> {
  try {
    const result = await apiClient(
      `/estimates/${encodeURIComponent(estimatePublicId)}/convert`,
      {
        method: "POST",
      }
    );
    return { invoicePublicId: result.invoicePublicId };
  } catch (error) {
    console.error(
      `Error converting estimate ${estimatePublicId} to invoice:`,
      error
    );
    throw error;
  }
}
