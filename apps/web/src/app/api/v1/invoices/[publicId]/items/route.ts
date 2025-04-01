import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";

// POST - Add a new item to an invoice
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;

    // Check if this invoice belongs to the user
    const { data: existingInvoice, error: invoiceError } = await supabase
      .from("Invoices")
      .select("*")
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (invoiceError || !existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get item data from request body
    const itemData = await req.json();

    // Add the item to the invoice
    const { data: newItem, error: insertError } = await supabase
      .from("InvoiceItems")
      .insert({
        ...itemData,
        invoicePublicId: publicId,
        userId: authenticatedUser.id,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in POST /api/v1/invoices/${publicId}/items`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error adding invoice item";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT - Update an invoice item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;

    // Get the item data from the request
    const itemData = await req.json();

    // Verify that the item exists and belongs to the user
    const { data: existingItem, error: itemFetchError } = await supabase
      .from("InvoiceItems")
      .select("*")
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (itemFetchError || !existingItem) {
      return NextResponse.json(
        { error: "Invoice item not found" },
        { status: 404 }
      );
    }

    // Update the invoice item
    const { data: updatedItem, error: updateError } = await supabase
      .from("InvoiceItems")
      .update(itemData)
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

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
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;

    // Verify that the item exists and belongs to the user
    const { data: existingItem, error: itemFetchError } = await supabase
      .from("InvoiceItems")
      .select("*")
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (itemFetchError || !existingItem) {
      return NextResponse.json(
        { error: "Invoice item not found" },
        { status: 404 }
      );
    }

    // Soft delete the invoice item (set isDeleted to true)
    const { error: deleteError } = await supabase
      .from("InvoiceItems")
      .update({ isDeleted: true })
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in DELETE /api/v1/invoices/items/${publicId}`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error deleting invoice item";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
