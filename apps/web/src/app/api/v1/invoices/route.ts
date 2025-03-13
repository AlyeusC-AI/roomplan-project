import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInvoice, getInvoices } from "@/lib/invoices";

// GET - Retrieve all invoices
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Get status filter from query params
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    // Get invoices for the current user
    const invoices = await getInvoices(user.id, status);

    return NextResponse.json({ invoices }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/v1/invoices", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error fetching invoices";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Create a new invoice
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Get request body
    const { invoice, invoiceItems, paymentSchedules } = await req.json();

    // Make sure userId is set to the current user
    invoice.userId = user.id;

    // Create the invoice
    const newInvoice = await createInvoice(
      invoice,
      invoiceItems,
      paymentSchedules
    );

    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/v1/invoices", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error creating invoice";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
