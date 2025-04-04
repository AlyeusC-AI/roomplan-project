import { SavedLineItem } from "@/atoms/invoices";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Get all saved line items for the current user
export const getSavedLineItems = async () => {
  const supabase = createClient();

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
  const supabase = createClient();

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
  const supabase = createClient();

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
  const supabase = createClient();

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
