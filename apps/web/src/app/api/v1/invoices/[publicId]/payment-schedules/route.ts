import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import crypto from "crypto";

// POST - Add a new payment schedule to an invoice
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;

    // Check if this invoice belongs to the user
    const { data: invoice, error: invoiceError } = await supabase
      .from("Invoices")
      .select("*")
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Not authorized to add payment schedules to this invoice" },
        { status: 403 }
      );
    }

    // Get payment schedule data from request body
    const scheduleData = await req.json();

    // Generate a new UUID for the payment schedule
    const schedulePublicId = crypto.randomUUID();

    // Insert directly using SQL query to bypass schema issues
    const { error: scheduleError } = await supabase
      .from("PaymentSchedules")
      .insert({
        invoicePublicId: publicId,
        publicId: schedulePublicId,
        userId: authenticatedUser.id,
        dueDate: scheduleData.dueDate,
        amount: scheduleData.amount,
        description: scheduleData.description || null,
        isPaid: false,
      });

    if (scheduleError) {
      console.error("Error creating payment schedule:", scheduleError);
      throw scheduleError;
    }

    // Return the created schedule
    return NextResponse.json(
      {
        schedule: {
          publicId: schedulePublicId,
          invoiceId: invoice.id,
          dueDate: scheduleData.dueDate,
          amount: scheduleData.amount,
          description: scheduleData.description,
          isPaid: false,
        },
      },
      { status: 201 }
    );
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

// PUT - Update a payment schedule
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;

    // Get the schedule data from the request
    const scheduleData = await req.json();

    // Verify that the payment schedule exists and belongs to the user
    const { data: existingSchedule, error: scheduleFetchError } = await supabase
      .from("PaymentSchedules")
      .select("*")
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (scheduleFetchError || !existingSchedule) {
      return NextResponse.json(
        { error: "Payment schedule not found" },
        { status: 404 }
      );
    }

    // Update the payment schedule
    const { data: updatedSchedule, error: updateError } = await supabase
      .from("PaymentSchedules")
      .update(scheduleData)
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

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
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const { publicId } = await params;

    // Verify that the payment schedule exists and belongs to the user
    const { data: existingSchedule, error: scheduleFetchError } = await supabase
      .from("PaymentSchedules")
      .select("*")
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (scheduleFetchError || !existingSchedule) {
      return NextResponse.json(
        { error: "Payment schedule not found" },
        { status: 404 }
      );
    }

    // Soft delete the payment schedule (set isDeleted to true)
    const { error: deleteError } = await supabase
      .from("PaymentSchedules")
      .update({ isDeleted: true })
      .eq("publicId", publicId)
      .eq("userId", authenticatedUser.id);

    if (deleteError) {
      throw deleteError;
    }

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
