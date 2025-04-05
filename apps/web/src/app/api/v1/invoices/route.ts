import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import { supabaseServiceRole } from "@lib/supabase/admin";

// GET /api/v1/invoices - List all invoices
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [, authenticatedUser] = await user(req);

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Build query
    let query = supabaseServiceRole
      .from("Invoices")
      .select("*")
      .eq(
        "organizationPublicId",
        authenticatedUser.user_metadata.organizationId
      )
      .eq("isDeleted", false)
      .order("createdAt", { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Execute query
    const { data: invoices, error } = await query;

    console.log(authenticatedUser.user_metadata.organizationId);
    console.log(invoices);
    console.log(error);

    if (error) throw error;
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/v1/invoices - Create a new invoice
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    // Parse request body
    const body = await req.json();
    const { invoice, invoiceItems } = body;

    // Add user ID to the invoice
    invoice.userId = authenticatedUser.id;

    // Insert invoice
    const { data: createdInvoice, error } = await supabase
      .from("Invoices")
      .insert({
        ...invoice,
        organizationPublicId: authenticatedUser.user_metadata.organizationId,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert invoice items
    if (invoiceItems && invoiceItems.length > 0) {
      const itemsWithInvoiceId = invoiceItems.map(
        (item: {
          description: string;
          quantity: number;
          rate: number;
          amount: number;
          notes?: string;
        }) => ({
          ...item,
          invoicePublicId: createdInvoice.publicId,
        })
      );

      const { error: itemsError } = await supabase
        .from("InvoiceItems")
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ invoice: createdInvoice });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}
