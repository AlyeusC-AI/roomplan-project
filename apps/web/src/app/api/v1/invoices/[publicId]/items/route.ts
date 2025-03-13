import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addInvoiceItem, getInvoiceByPublicId } from "@/lib/invoices";

// POST - Add a new item to an invoice
export async function POST(
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

    // Check if this invoice belongs to the user
    const existingInvoice = await getInvoiceByPublicId(publicId);
    if (existingInvoice.userId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to add items to this invoice" },
        { status: 403 }
      );
    }

    // Get item data from request body
    const itemData = await req.json();

    // Add the item to the invoice
    const newItem = await addInvoiceItem(publicId, itemData);

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in POST /api/v1/invoices/${publicId}/items`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error adding invoice item";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
