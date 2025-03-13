import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addPaymentSchedule, getInvoiceByPublicId } from "@/lib/invoices";

// POST - Add a new payment schedule to an invoice
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
        { error: "Not authorized to add payment schedules to this invoice" },
        { status: 403 }
      );
    }

    // Get payment schedule data from request body
    const scheduleData = await req.json();

    // Add the payment schedule to the invoice
    const newSchedule = await addPaymentSchedule(publicId, scheduleData);

    return NextResponse.json({ schedule: newSchedule }, { status: 201 });
  } catch (error) {
    const { publicId } = await params;
    console.error(
      `Error in POST /api/v1/invoices/${publicId}/payment-schedules`,
      error
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error creating payment schedules";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
