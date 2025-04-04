import { SavedLineItem } from "@/lib/state/estimates";
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from "uuid";

// Get all saved line items for the current user
export const getSavedLineItems = async () => {
  const { data, error } = await supabase
    .from("SavedLineItems")
    .select("*")
    .eq("isDeleted", false)
    .order("description", { ascending: true });

  if (error) {
    console.error("Error fetching saved line items", error);
    return { error: error.message };
  }

  return { data };
};

// Create a new saved line item
export const createSavedLineItem = async (
  description: string,
  rate: number,
  category?: string
) => {
  const newItem = {
    publicId: uuidv4(),
    description,
    rate,
    category,
  };

  const { data, error } = await supabase
    .from("SavedLineItems")
    .insert(newItem)
    .select()
    .single();

  if (error) {
    console.error("Error creating saved line item", error);
    return { error: error.message };
  }

  return { data };
};

// Update a saved line item
export const updateSavedLineItem = async (
  publicId: string,
  updates: Partial<SavedLineItem>
) => {
  const { data, error } = await supabase
    .from("SavedLineItems")
    .update(updates)
    .eq("publicId", publicId)
    .select()
    .single();

  if (error) {
    console.error("Error updating saved line item", error);
    return { error: error.message };
  }

  return { data };
};

// Delete a saved line item (soft delete)
export const deleteSavedLineItem = async (publicId: string) => {
  const { data, error } = await supabase
    .from("SavedLineItems")
    .update({ isDeleted: true })
    .eq("publicId", publicId)
    .select()
    .single();

  if (error) {
    console.error("Error deleting saved line item", error);
    return { error: error.message };
  }

  return { data };
};

/**
 * Get saved line items by category
 */
export async function fetchSavedLineItemsByCategory(category: string): Promise<ApiResponse<SavedLineItem[]>> {
  try {
    const data = await apiClient(`/saved-line-items/category/${encodeURIComponent(category)}`);
    return { data: data.items };
  } catch (error) {
    console.error(`Error fetching saved line items for category ${category}:`, error);
    return { 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
} 