import { apiClient } from "./api-client";

export interface SavedLineItem {
  id?: number;
  publicId: string;
  name: string;
  description: string;
  rate: number;
  category?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch all saved line items
 */
export async function fetchSavedLineItems(): Promise<SavedLineItem[]> {
  try {
    const data = await apiClient("/saved-line-items");
    return data.items;
  } catch (error) {
    console.error("Error fetching saved line items:", error);
    throw error;
  }
}

/**
 * Create a new saved line item
 */
export async function createSavedLineItem(
  item: Omit<SavedLineItem, "id" | "publicId">
): Promise<SavedLineItem> {
  try {
    const result = await apiClient("/saved-line-items", {
      method: "POST",
      body: JSON.stringify(item),
    });
    return result.item;
  } catch (error) {
    console.error("Error creating saved line item:", error);
    throw error;
  }
}

/**
 * Update an existing saved line item
 */
export async function updateSavedLineItem(
  publicId: string,
  updates: Partial<SavedLineItem>
): Promise<SavedLineItem> {
  try {
    const result = await apiClient(
      `/saved-line-items/${encodeURIComponent(publicId)}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
    return result.item;
  } catch (error) {
    console.error(`Error updating saved line item ${publicId}:`, error);
    throw error;
  }
}

/**
 * Delete a saved line item (soft delete)
 */
export async function deleteSavedLineItem(
  publicId: string
): Promise<{ success: boolean }> {
  try {
    await apiClient(`/saved-line-items/${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error) {
    console.error(`Error deleting saved line item ${publicId}:`, error);
    throw error;
  }
}

/**
 * Get saved line items by category
 */
export async function fetchSavedLineItemsByCategory(
  category: string
): Promise<SavedLineItem[]> {
  try {
    const data = await apiClient(
      `/saved-line-items/category/${encodeURIComponent(category)}`
    );
    return data.items;
  } catch (error) {
    console.error(
      `Error fetching saved line items for category ${category}:`,
      error
    );
    throw error;
  }
}

/**
 * Export saved line items to CSV
 * Returns a URL that can be used to download the CSV file
 */
export function getExportCsvUrl(category: string | null = null): string {
  const baseUrl = "/api/v1/saved-line-items/export";
  if (category) {
    return `${baseUrl}?category=${encodeURIComponent(category)}`;
  }
  return baseUrl;
}

/**
 * Import saved line items from a CSV file
 */
export async function importSavedLineItemsFromCsv(
  file: File
): Promise<{ imported: number; total: number }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/v1/saved-line-items/import", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to import data");
    }

    const result = await response.json();
    return {
      imported: result.imported,
      total: result.total,
    };
  } catch (error) {
    console.error("Error importing saved line items:", error);
    throw error;
  }
}
