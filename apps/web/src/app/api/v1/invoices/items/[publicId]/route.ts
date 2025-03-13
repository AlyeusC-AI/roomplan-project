import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateInvoiceItem, deleteInvoiceItem } from "@/lib/invoices";

// PUT - Update an invoice item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { publicId } = await params;

    // Get the item data from the request
    const itemData = await req.json();

    // User authorization check is handled indirectly by the RLS policies
    // since the invoice items table has reference to invoices which has the userId

    // Update the invoice item
    const updatedItem = await updateInvoiceItem(publicId, itemData);

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in PUT /api/v1/invoices/items/${publicId}`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error updating invoice item";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete an invoice item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { publicId } = await params;

    // User authorization check is handled indirectly by the RLS policies

    // Soft delete the invoice item
    await deleteInvoiceItem(publicId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in DELETE /api/v1/invoices/items/${publicId}`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error deleting invoice item";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
