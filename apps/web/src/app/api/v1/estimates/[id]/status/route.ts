import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/estimates/[id]/status - Update an estimate's status
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(request);
    const id = (await params).id;

    // Parse the request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate the status
    const validStatuses = [
      "draft",
      "sent",
      "approved",
      "rejected",
      "cancelled",
      "expired",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if the estimate exists and belongs to the user
    const { data: existingEstimate, error: existingError } = await supabase
      .from("Estimates")
      .select("*")
      .eq("publicId", id)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .single();

    if (existingError || !existingEstimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Update the estimate status
    const { error: updateError } = await supabase
      .from("Estimates")
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq("publicId", id)
      .eq("userId", authenticatedUser.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error updating estimate status:", updateError);
      return NextResponse.json(
        { error: "Failed to update estimate status" },
        { status: 500 }
      );
    }

    // Fetch the updated estimate with items
    const { data: completeEstimate, error: completeError } = await supabase
      .from("Estimates")
      .select(
        `
        *,
        EstimateItems (*)
      `
      )
      .eq("publicId", id)
      .eq("userId", authenticatedUser.id)
      .single();

    if (completeError) {
      console.error("Error fetching updated estimate:", completeError);
      return NextResponse.json(
        { error: "Failed to fetch updated estimate" },
        { status: 500 }
      );
    }

    // Format the response
    const items = completeEstimate.EstimateItems || [];
    const response = {
      id: completeEstimate.id,
      publicId: completeEstimate.publicId,
      number: completeEstimate.number,
      clientName: completeEstimate.clientName,
      clientEmail: completeEstimate.clientEmail || "",
      projectName: completeEstimate.projectName,
      projectId: completeEstimate.projectPublicId || "",
      amount: completeEstimate.amount,
      status: completeEstimate.status,
      createdAt: completeEstimate.createdAt,
      expiryDate: completeEstimate.expiryDate,
      items: items.map(
        (item: {
          id: string;
          description: string;
          quantity: number;
          rate: number;
          amount: number;
        }) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })
      ),
    };

    return NextResponse.json({ estimate: response });
  } catch (error) {
    console.error(
      "Unexpected error in PATCH /api/v1/estimates/[id]/status:",
      error
    );
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
