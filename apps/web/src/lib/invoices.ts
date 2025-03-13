import { Database } from "@/types/database";
import { createClient } from "./supabase/server";
import { v4 as uuidv4 } from "uuid";

// Get all invoices for the current user or their organization
export const getInvoices = async (userId: string, status?: string) => {
  const supabase = await createClient();

  let query = supabase
    .from("Invoices")
    .select(
      `
      *,
      InvoiceItems (*)
    `
    )
    .eq("isDeleted", false)
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching invoices", error);
    throw new Error(`Error fetching invoices: ${error.message}`);
  }

  return data || [];
};

// Get a single invoice by its public ID
export const getInvoiceByPublicId = async (publicId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select(
      `
      *,
      InvoiceItems (*),
      PaymentSchedules (*)
    `
    )
    .eq("publicId", publicId)
    .eq("isDeleted", false)
    .single();

  if (error) {
    console.error("Error fetching invoice", error);
    throw new Error(`Error fetching invoice: ${error.message}`);
  }

  return data;
};

// Create a new invoice
export const createInvoice = async (
  invoice: Database["public"]["Tables"]["Invoices"]["Row"],
  invoiceItems: Database["public"]["Tables"]["InvoiceItems"]["Row"][] = [],
  paymentSchedules: Database["public"]["Tables"]["PaymentSchedules"]["Row"][] = []
) => {
  const supabase = await createClient();

  // Generate a public ID for the invoice
  const publicId = uuidv4();

  // Insert the invoice
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("Invoices")
    .insert({
      ...invoice,
      publicId,
    })
    .select("*")
    .single();

  if (invoiceError) {
    console.error("Error creating invoice", invoiceError);
    throw new Error(`Error creating invoice: ${invoiceError.message}`);
  }

  // Insert invoice items
  if (invoiceItems.length > 0) {
    const formattedItems = invoiceItems.map((item) => ({
      ...item,
      publicId: uuidv4(),
      invoicePublicId: publicId,
    }));

    const { error: itemsError } = await supabase
      .from("InvoiceItems")
      .insert(formattedItems);

    if (itemsError) {
      console.error("Error creating invoice items", itemsError);
      throw new Error(`Error creating invoice items: ${itemsError.message}`);
    }
  }

  // Insert payment schedules
  if (paymentSchedules.length > 0) {
    const formattedSchedules = paymentSchedules.map((schedule) => ({
      ...schedule,
      publicId: uuidv4(),
      invoicePublicId: publicId,
    }));

    const { error: schedulesError } = await supabase
      .from("PaymentSchedules")
      .insert(formattedSchedules);

    if (schedulesError) {
      console.error("Error creating payment schedules", schedulesError);
      throw new Error(
        `Error creating payment schedules: ${schedulesError.message}`
      );
    }
  }

  return invoiceData;
};

// Update an invoice
export const updateInvoice = async (
  publicId: string,
  updates: Database["public"]["Tables"]["Invoices"]["Row"]
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .update(updates)
    .eq("publicId", publicId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating invoice", error);
    throw new Error(`Error updating invoice: ${error.message}`);
  }

  return data;
};

// Delete an invoice (soft delete)
export const deleteInvoice = async (publicId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("Invoices")
    .update({ isDeleted: true })
    .eq("publicId", publicId);

  if (error) {
    console.error("Error deleting invoice", error);
    throw new Error(`Error deleting invoice: ${error.message}`);
  }

  return true;
};

// Add an invoice item to an existing invoice
export const addInvoiceItem = async (
  invoicePublicId: string,
  item: Database["public"]["Tables"]["InvoiceItems"]["Row"]
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("InvoiceItems")
    .insert({
      ...item,
      publicId: uuidv4(),
      invoicePublicId,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error adding invoice item", error);
    throw new Error(`Error adding invoice item: ${error.message}`);
  }

  return data;
};

// Update an invoice item
export const updateInvoiceItem = async (
  publicId: string,
  updates: Database["public"]["Tables"]["InvoiceItems"]["Row"]
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("InvoiceItems")
    .update(updates)
    .eq("publicId", publicId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating invoice item", error);
    throw new Error(`Error updating invoice item: ${error.message}`);
  }

  return data;
};

// Delete an invoice item (soft delete)
export const deleteInvoiceItem = async (publicId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("InvoiceItems")
    .update({ isDeleted: true })
    .eq("publicId", publicId);

  if (error) {
    console.error("Error deleting invoice item", error);
    throw new Error(`Error deleting invoice item: ${error.message}`);
  }

  return true;
};

// Add a payment schedule to an invoice
export const addPaymentSchedule = async (
  invoicePublicId: string,
  schedule: Database["public"]["Tables"]["PaymentSchedules"]["Row"]
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("PaymentSchedules")
    .insert({
      ...schedule,
      publicId: uuidv4(),
      invoicePublicId,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error adding payment schedule", error);
    throw new Error(`Error adding payment schedule: ${error.message}`);
  }

  return data;
};

// Update a payment schedule
export const updatePaymentSchedule = async (
  publicId: string,
  updates: Database["public"]["Tables"]["PaymentSchedules"]["Row"]
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("PaymentSchedules")
    .update(updates)
    .eq("publicId", publicId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating payment schedule", error);
    throw new Error(`Error updating payment schedule: ${error.message}`);
  }

  return data;
};

// Delete a payment schedule (soft delete)
export const deletePaymentSchedule = async (publicId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("PaymentSchedules")
    .update({ isDeleted: true })
    .eq("publicId", publicId);

  if (error) {
    console.error("Error deleting payment schedule", error);
    throw new Error(`Error deleting payment schedule: ${error.message}`);
  }

  return true;
};

// Update invoice status
export const updateInvoiceStatus = async (
  publicId: string,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .update({ status })
    .eq("publicId", publicId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating invoice status", error);
    throw new Error(`Error updating invoice status: ${error.message}`);
  }

  return data;
};

// Get invoices for a specific project
export const getInvoicesByProject = async (projectPublicId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Invoices")
    .select(
      `
      *,
      InvoiceItems (*)
    `
    )
    .eq("projectPublicId", projectPublicId)
    .eq("isDeleted", false)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching project invoices", error);
    throw new Error(`Error fetching project invoices: ${error.message}`);
  }

  return data || [];
};

// Calculate invoice totals
export const calculateInvoiceTotals = (
  invoice: Database["public"]["Tables"]["Invoices"]["Row"],
  items: Database["public"]["Tables"]["InvoiceItems"]["Row"][]
) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + Number(item.amount), 0);

  // Calculate markup
  const markupAmount = invoice.markupPercentage
    ? subtotal * (Number(invoice.markupPercentage) / 100)
    : Number(invoice.markupAmount) || 0;

  // Calculate after markup
  const afterMarkup = subtotal + markupAmount;

  // Calculate discount
  const discountAmount = Number(invoice.discountAmount) || 0;

  // Calculate after discount
  const afterDiscount = afterMarkup - discountAmount;

  // Calculate tax
  const taxAmount = invoice.taxRate
    ? afterDiscount * (Number(invoice.taxRate) / 100)
    : Number(invoice.taxAmount) || 0;

  // Calculate total
  const total = afterDiscount + taxAmount;

  // Calculate deposit
  const depositAmount = invoice.depositPercentage
    ? total * (Number(invoice.depositPercentage) / 100)
    : Number(invoice.depositAmount) || 0;

  return {
    subtotal,
    markupAmount,
    afterMarkup,
    discountAmount,
    afterDiscount,
    taxAmount,
    total,
    depositAmount,
    balanceDue: total - depositAmount,
  };
};
