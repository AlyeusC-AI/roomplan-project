import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getInvoiceByPublicId,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from "@/lib/invoices";

// GET - Get a single invoice by its public ID
export async function GET(
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

    // Get invoice details
    const invoice = await getInvoiceByPublicId(publicId);

    // Check if this invoice belongs to the user or their organization
    if (invoice.userId !== user.id) {
      // TODO: Add organization check once org access is configured
      return NextResponse.json(
        { error: "Not authorized to access this invoice" },
        { status: 403 }
      );
    }

    return NextResponse.json({ invoice }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in GET /api/v1/invoices/${publicId}`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error fetching invoice";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT - Update an invoice
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

    // Check if this invoice belongs to the user
    const existingInvoice = await getInvoiceByPublicId(publicId);
    if (existingInvoice.userId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this invoice" },
        { status: 403 }
      );
    }

    // Get updates from request body
    const updates = await req.json();

    // Don't allow changing the userId
    delete updates.userId;
    delete updates.publicId;

    // Update the invoice
    const updatedInvoice = await updateInvoice(publicId, updates);

    return NextResponse.json({ invoice: updatedInvoice }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in PUT /api/v1/invoices/${publicId}`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error updating invoice";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Soft delete an invoice
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

    // Check if this invoice belongs to the user
    const existingInvoice = await getInvoiceByPublicId(publicId);
    if (existingInvoice.userId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this invoice" },
        { status: 403 }
      );
    }

    // Soft delete the invoice
    await deleteInvoice(publicId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in DELETE /api/v1/invoices/${publicId}`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error deleting invoice";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH - Update invoice status
export async function PATCH(
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
        { error: "Not authorized to update this invoice" },
        { status: 403 }
      );
    }

    // Get status from request body
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Update the invoice status
    const updatedInvoice = await updateInvoiceStatus(publicId, status);

    return NextResponse.json({ invoice: updatedInvoice }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(`Error in PATCH /api/v1/invoices/${publicId}`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error updating invoice status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
