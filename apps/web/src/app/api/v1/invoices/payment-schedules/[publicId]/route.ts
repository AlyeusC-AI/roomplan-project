import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePaymentSchedule, deletePaymentSchedule } from "@/lib/invoices";

// PUT - Update a payment schedule
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

    // Get the schedule data from the request
    const scheduleData = await req.json();

    // User authorization check is handled indirectly by the RLS policies
    // since payment schedules table has reference to invoices which has the userId

    // Update the payment schedule
    const updatedSchedule = await updatePaymentSchedule(publicId, scheduleData);

    return NextResponse.json({ schedule: updatedSchedule }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(
      `Error in PUT /api/v1/invoices/payment-schedules/${publicId}`,
      error
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error updating payment schedule";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete a payment schedule
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

    // Soft delete the payment schedule
    await deletePaymentSchedule(publicId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const { publicId } = await params;
    console.error(
      `Error in DELETE /api/v1/invoices/payment-schedules/${publicId}`,
      error
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error deleting payment schedule";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
