import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import { Database } from "@/types/database";

// GET /api/v1/estimates - List all estimates
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Build query
    let query = supabase
      .from("Estimates")
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
    const { data: estimates, error } = await query;

    console.log("estimates", authenticatedUser.user_metadata.organizationId);

    if (error) throw error;
    return NextResponse.json({ estimates });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/v1/estimates - Create a new estimate
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    // Parse request body
    const body = await req.json();
    const { estimate, estimateItems } = body;

    // Add user ID to the estimate
    estimate.userId = authenticatedUser.id;

    // Insert estimate
    const { data: createdEstimate, error } = await supabase
      .from("Estimates")
      .insert({
        ...estimate,
        organizationPublicId: authenticatedUser.user_metadata.organizationId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating estimate:", error);
      throw error;
    }

    // Insert estimate items
    if (estimateItems && estimateItems.length > 0) {
      const itemsWithEstimateId = estimateItems.map(
        (item: {
          description: string;
          quantity: number;
          rate: number;
          amount: number;
          notes?: string;
        }): Database["public"]["Tables"]["EstimateItems"]["Insert"] => ({
          ...item,
          estimatePublicId: createdEstimate.publicId,
        })
      );

      const { error: itemsError } = await supabase
        .from("EstimateItems")
        .insert(itemsWithEstimateId);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ estimate: createdEstimate });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}
