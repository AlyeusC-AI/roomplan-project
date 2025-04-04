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
    const response = await fetch("/api/v1/estimates");

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Failed to fetch estimates" };
    }

    const data = await response.json();
    return { data: data.estimates };
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Get a single estimate by ID
export const getEstimateById = async (
  id: string
): Promise<EstimateResponse> => {
  try {
    const response = await fetch(`/api/v1/estimates/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || `Failed to fetch estimate ${id}` };
    }

    const data = await response.json();
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
    const response = await fetch("/api/v1/estimates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Failed to create estimate" };
    }

    const responseData = await response.json();
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
    const response = await fetch(`/api/v1/estimates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || `Failed to update estimate ${id}` };
    }

    const responseData = await response.json();
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
    const response = await fetch(`/api/v1/estimates/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || `Failed to delete estimate ${id}` };
    }

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
    const response = await fetch(`/api/v1/estimates/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.error || `Failed to update estimate ${id} status`,
      };
    }

    const responseData = await response.json();
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
    const response = await fetch(`/api/v1/estimates/${id}/convert`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.error || `Failed to convert estimate ${id} to invoice`,
      };
    }

    const responseData = await response.json();
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
    const response = await fetch(
      `/api/v1/projects/${projectPublicId}/estimates`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Failed to fetch project estimates" };
    }

    const data = await response.json();
    return { data: data.estimates };
  } catch (error) {
    console.error("Error fetching project estimates:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Send an estimate to client via email
export const emailEstimate = async (
  id: string,
  message?: string
): Promise<{ success?: boolean; message?: string; error?: string }> => {
  try {
    const response = await fetch(`/api/v1/estimates/${id}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to email estimate" };
    }

    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error(`Error emailing estimate ${id}:`, error);
    return {
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};
