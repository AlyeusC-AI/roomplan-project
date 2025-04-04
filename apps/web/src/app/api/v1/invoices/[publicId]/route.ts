import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";

// GET /api/v1/invoices/[id] - Get a specific invoice by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const invoiceId = (await params).publicId;

    // Get the invoice
    const { data: invoice, error } = await supabase
      .from("Invoices")
      .select("*, InvoiceItems(*)")
      .eq("publicId", invoiceId)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .single();

    if (error) throw error;

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error(`API error getting invoices:`, error);
    return NextResponse.json(
      { error: "Unauthorized or invoice not found" },
      { status: 401 }
    );
  }
}

// PUT /api/v1/invoices/[id] - Update an invoice
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;
    const invoiceId = publicId;
    const { invoice } = await req.json();

    // Verify that the invoice exists and belongs to the user
    const { error: fetchError } = await supabase
      .from("Invoices")
      .select("*")
      .eq("publicId", invoiceId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (fetchError) throw fetchError;

    // Update the invoice
    const { data: updatedInvoice, error } = await supabase
      .from("Invoices")
      .update(invoice)
      .eq("publicId", invoiceId)
      .eq("userId", authenticatedUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    console.error(`API error updating invoice:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}

// DELETE /api/v1/invoices/[id] - Soft delete an invoice
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;
    const invoiceId = publicId;

    // Soft delete the invoice
    const { error } = await supabase
      .from("Invoices")
      .update({ isDeleted: true })
      .eq("publicId", invoiceId)
      .eq("userId", authenticatedUser.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API error deleting invoice:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}

// PATCH /api/v1/invoices/[id] - Update invoice status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;
    const invoiceId = publicId;
    const { status } = await req.json();

    // Update the invoice status
    const { data: updatedInvoice, error } = await supabase
      .from("Invoices")
      .update({ status })
      .eq("publicId", invoiceId)
      .eq("userId", authenticatedUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    console.error(`API error updating invoice status:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}
