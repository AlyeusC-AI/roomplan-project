import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";

// GET /api/v1/estimates/[id] - Get a specific estimate by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase] = await user(req);

    const estimateId = (await params).id;

    // Get the estimate
    const { data: estimate, error } = await supabase
      .from("Estimates")
      .select("*, EstimateItems(*)")
      .eq("publicId", estimateId)
      .eq("isDeleted", false)
      .single();

    if (error) throw error;

    console.log(estimate);

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error(`API error getting estimate:`, error);
    return NextResponse.json(
      { error: "Unauthorized or estimate not found" },
      { status: 401 }
    );
  }
}

// PUT /api/v1/estimates/[id] - Update an estimate
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const estimateId = (await params).id;
    const { estimate } = await req.json();

    // Verify that the estimate exists and belongs to the user
    const { error: fetchError } = await supabase
      .from("Estimates")
      .select("*")
      .eq("publicId", estimateId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (fetchError) throw fetchError;

    // Update the estimate
    const { data: updatedEstimate, error } = await supabase
      .from("Estimates")
      .update(estimate)
      .eq("publicId", estimateId)
      .eq("userId", authenticatedUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ estimate: updatedEstimate });
  } catch (error) {
    console.error(`API error updating estimate:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}

// DELETE /api/v1/estimates/[id] - Soft delete an estimate
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const estimateId = (await params).id;

    // Soft delete the estimate
    const { error } = await supabase
      .from("Estimates")
      .update({ isDeleted: true })
      .eq("publicId", estimateId)
      .eq("userId", authenticatedUser.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API error deleting estimate:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}

// PATCH /api/v1/estimates/[id] - Update estimate status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const estimateId = (await params).id;
    const { status } = await req.json();

    // Update the estimate status
    const { data: updatedEstimate, error } = await supabase
      .from("Estimates")
      .update({ status })
      .eq("publicId", estimateId)
      .eq("userId", authenticatedUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ estimate: updatedEstimate });
  } catch (error) {
    console.error(`API error updating estimate status:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}

// POST /api/v1/estimates/[id]/convert - Convert estimate to invoice
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const estimateId = params.id;

    // Get the estimate with its items
    const { data: estimate, error: fetchError } = await supabase
      .from("Estimates")
      .select("*, EstimateItems(*)")
      .eq("publicId", estimateId)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .single();

    if (fetchError) throw fetchError;

    // Create a new invoice from the estimate data
    const invoiceData = {
      publicId: crypto.randomUUID(),
      number: `INV-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      clientName: estimate.clientName,
      clientEmail: estimate.clientEmail,
      projectPublicId: estimate.projectPublicId,
      poNumber: estimate.poNumber,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal: estimate.subtotal,
      discountAmount: estimate.discountAmount,
      markupPercentage: estimate.markupPercentage,
      markupAmount: estimate.markupAmount,
      taxRate: estimate.taxRate,
      taxAmount: estimate.taxAmount,
      depositPercentage: estimate.depositPercentage,
      depositAmount: estimate.depositAmount,
      amount: estimate.amount,
      status: "draft",
      notes: estimate.notes,
      projectName: estimate.projectName,
      estimatePublicId: estimateId,
      userId: authenticatedUser.id,
    };

    // Insert the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("Invoices")
      .insert({ ...invoiceData, status: "draft" })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Convert estimate items to invoice items
    if (estimate.EstimateItems && estimate.EstimateItems.length > 0) {
      const invoiceItems = estimate.EstimateItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        invoicePublicId: invoice.publicId,
        userId: authenticatedUser.id,
      }));

      const { error: itemsError } = await supabase
        .from("InvoiceItems")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;
    }

    // Update the estimate's status to 'converted'
    await supabase
      .from("Estimates")
      .update({ status: "sent" })
      .eq("publicId", estimateId)
      .eq("userId", authenticatedUser.id);

    return NextResponse.json({
      success: true,
      invoicePublicId: invoice.publicId,
    });
  } catch (error) {
    console.error(`API error converting estimate:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}
