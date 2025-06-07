import { apiClient } from './client';

export interface CreateEstimateRequest {
  estimate: {
    number: string;
    clientName: string;
    clientEmail?: string;
    projectName: string;
    projectPublicId?: string;
    poNumber?: string;
    estimateDate: string;
    expiryDate: string;
    subtotal: number;
    markup?: number;
    discount?: number;
    tax?: number;
    amount: number;
    deposit?: number;
    status: "draft" | "sent" | "approved" | "rejected";
    notes?: string;
  };
  estimateItems: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

export interface UpdateEstimateRequest {
  estimate: Partial<CreateEstimateRequest["estimate"]>;
  estimateItems?: CreateEstimateRequest["estimateItems"];
}

export interface EstimateResponse {
  error?: string;
  data?: Estimate;
}

export interface EstimatesResponse {
  error?: string;
  data?: Estimate[];
}

export interface ConversionResponse {
  error?: string;
  data?: {
    estimate: Estimate;
    invoiceId: string;
  };
}

// Get all estimates
export const getEstimates = async (): Promise<EstimatesResponse> => {
  try {
    const response = await apiClient("/api/v1/estimates");

    const data = response;
    return { data: data.estimates };
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Export fetchEstimates as an alias of getEstimates for compatibility
export const fetchEstimates = getEstimates;

// Get a single estimate by ID
export const getEstimateById = async (
  id: string
): Promise<EstimateResponse> => {
  try {
    const response = await apiClient(`/api/v1/estimates/${id}`);

    const data = response;
    return { data: data.estimate };
  } catch (error) {
    console.error(`Error fetching estimate ${id}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Create a new estimate
export const createEstimate = async (
  data: CreateEstimateRequest
): Promise<EstimateResponse> => {
  try {
    const response = await apiClient("/api/v1/estimates", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const responseData = response;
    return { data: responseData.estimate };
  } catch (error) {
    console.error("Error creating estimate:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Update an existing estimate
export const updateEstimate = async (
  id: string,
  data: UpdateEstimateRequest
): Promise<EstimateResponse> => {
  try {
    const response = await apiClient(`/api/v1/estimates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    const responseData = response;
    return { data: responseData.estimate };
  } catch (error) {
    console.error(`Error updating estimate ${id}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Delete an estimate
export const deleteEstimate = async (
  id: string
): Promise<{ error?: string }> => {
  try {
    await apiClient(`/api/v1/estimates/${id}`, {
      method: "DELETE",
    });

    return {};
  } catch (error) {
    console.error(`Error deleting estimate ${id}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Update estimate status
export const updateEstimateStatus = async (
  id: string,
  status: "draft" | "sent" | "approved" | "rejected" | "cancelled" | "expired"
): Promise<EstimateResponse> => {
  try {
    const response = await apiClient(`/api/v1/estimates/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    const responseData = response;
    return { data: responseData.estimate };
  } catch (error) {
    console.error(`Error updating estimate ${id} status:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Convert estimate to invoice
export const convertEstimateToInvoice = async (
  id: string
): Promise<ConversionResponse> => {
  try {
    const response = await apiClient(`/api/v1/estimates/${id}/convert`, {
      method: "POST",
    });

    const responseData = response;
    return {
      data: {
        estimate: responseData.estimate,
        invoiceId: responseData.invoicePublicId,
      },
    };
  } catch (error) {
    console.error(`Error converting estimate ${id} to invoice:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Fetch estimates for a specific project
 */
export async function fetchEstimatesByProject(
  projectPublicId: string
): Promise<{ data?: Estimate[]; error?: string }> {
  try {
    const response = await apiClient(
      `/api/v1/projects/${projectPublicId}/estimates`
    );

    return { data: response.estimates };
  } catch (error) {
    console.error(`Error fetching estimates for project ${projectPublicId}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Email an estimate to the client
 */
export const emailEstimate = async (
  id: string,
  message?: string
): Promise<{ success?: boolean; message?: string; error?: string }> => {
  try {
    const response = await apiClient(`/api/v1/estimates/${id}/email`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    return {
      success: true,
      message: response.message || "Estimate sent successfully",
    };
  } catch (error) {
    console.error(`Error emailing estimate ${id}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}; 