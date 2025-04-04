import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import crypto from "crypto";

// GET /api/v1/saved-line-items - List all saved line items
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    // Parse query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    // Build query
    let query = supabase
      .from("SavedLineItems")
      .select("*")
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .order("description", { ascending: true });

    // Apply category filter if provided
    if (category) {
      query = query.eq("category", category);
    }

    // Execute query
    const { data: items, error } = await query;

    if (error) throw error;
    return NextResponse.json({ items });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/v1/saved-line-items - Create a new saved line item
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    // Parse request body
    const body = await req.json();

    // Create new item with with our updated schema
    const newItem = {
      publicId: crypto.randomUUID(),
      userId: authenticatedUser.id,
      organizationId: authenticatedUser.user_metadata.organizationId,
      description: body.description,
      rate: body.rate,
      category: body.category || null,
      isDeleted: false,
    };

    const { data: item, error } = await supabase
      .from("SavedLineItems")
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error("Error creating saved line item:", error);
      throw error;
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 400 }
    );
  }
}
