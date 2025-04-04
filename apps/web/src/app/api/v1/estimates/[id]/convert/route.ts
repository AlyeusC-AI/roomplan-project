import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import { v4 as uuidv4 } from "uuid";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/v1/estimates/[id]/convert - Convert an estimate to an invoice
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(request);
    const id = (await params).id;

    // Check if the estimate exists and belongs to the user
    const { data: estimate, error: estimateError } = await supabase
      .from("Estimates")
      .select(
        `
        *,
        EstimateItems (*)
      `
      )
      .eq("publicId", id)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .single();

    if (estimateError || !estimate) {
      console.error("Error fetching estimate:", estimateError);
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    const typedEstimate = estimate; // Type assertion to avoid TypeScript errors

    // Only allow conversion of approved estimates
    if (typedEstimate.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved estimates can be converted to invoices" },
        { status: 400 }
      );
    }

    // Generate a new invoice number
    const invoiceNumber = `INV-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

    // Generate a public ID for the invoice
    const invoicePublicId = uuidv4();

    // Calculate due date (30 days from today by default)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (typedEstimate.daysToPay || 30));

    // Create the invoice
    const { error: invoiceError } = await supabase
      .from("Invoices")
      .insert({
        publicId: invoicePublicId,
        number: invoiceNumber,
        clientName: typedEstimate.clientName,
        clientEmail: typedEstimate.clientEmail,
        projectName: typedEstimate.projectName,
        projectPublicId: typedEstimate.projectPublicId,
        invoiceDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        subtotal: typedEstimate.subtotal,
        taxRate: typedEstimate.taxRate,
        taxAmount: typedEstimate.taxAmount,
        markupPercentage: typedEstimate.markupPercentage,
        markupAmount: typedEstimate.markupAmount,
        discountAmount: typedEstimate.discountAmount,
        depositPercentage: typedEstimate.depositPercentage,
        depositAmount: typedEstimate.depositAmount,
        amount: typedEstimate.amount,
        userId: authenticatedUser.id,
        status: "draft",
        poNumber: typedEstimate.poNumber,
        notes: typedEstimate.notes,
        hasPaymentSchedule: typedEstimate.hasPaymentSchedule,
        organizationPublicId: authenticatedUser.user_metadata.organizationId,
      })
      .select("*")
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      );
    }

    // Convert estimate items to invoice items
    const invoiceItems = typedEstimate.EstimateItems.map(
      (item: {
        id: string;
        description: string;
        quantity: number;
        rate: number;
        amount: number;
        sortOrder: number | null;
      }) => ({
        publicId: uuidv4(),
        invoicePublicId: invoicePublicId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sortOrder: item.sortOrder || 0,
      })
    );

    const { error: itemsError } = await supabase
      .from("InvoiceItems")
      .insert(invoiceItems);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      return NextResponse.json(
        { error: "Failed to create invoice items" },
        { status: 500 }
      );
    }

    // Update the estimate status to reflect it was converted
    const { error: updateError } = await supabase
      .from("Estimates")
      .update({
        status: "sent",
        updatedAt: new Date().toISOString(),
      })
      .eq("publicId", id)
      .eq("userId", authenticatedUser.id);

    if (updateError) {
      console.error("Error updating estimate status:", updateError);
      // Continue with the conversion, as the invoice is created
    }

    return NextResponse.json({ invoicePublicId });
  } catch (error) {
    console.error(
      "Unexpected error in POST /api/v1/estimates/[id]/convert:",
      error
    );
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
