import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";

// GET /api/v1/saved-line-items/[id] - Get a specific saved line item by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const itemId = (await params).id;

    // Get the saved line item
    const { data: item, error } = await supabase
      .from("SavedLineItems")
      .select("*")
      .eq("publicId", itemId)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .single();

    if (error) throw error;

    return NextResponse.json({ item });
  } catch (error) {
    console.error(`API error getting saved line item :`, error);
    return NextResponse.json(
      { error: "Unauthorized or item not found" },
      { status: 401 }
    );
  }
}

// PUT /api/v1/saved-line-items/[id] - Update a saved line item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const itemId = (await params).id;
    const updates = await req.json();

    // Verify that the item exists and belongs to the user
    const { error: fetchError } = await supabase
      .from("SavedLineItems")
      .select("*")
      .eq("publicId", itemId)
      .eq("userId", authenticatedUser.id)
      .single();

    if (fetchError) throw fetchError;

    // Update the saved line item
    const { data: updatedItem, error } = await supabase
      .from("SavedLineItems")
      .update(updates)
      .eq("publicId", itemId)
      .eq("userId", authenticatedUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error(`API error updating saved line item ${params.id}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}

// DELETE /api/v1/saved-line-items/[id] - Soft delete a saved line item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const itemId = params.id;

    // Soft delete the saved line item
    const { error } = await supabase
      .from("SavedLineItems")
      .update({ isDeleted: true })
      .eq("publicId", itemId)
      .eq("userId", authenticatedUser.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`API error deleting saved line item ${params.id}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}
