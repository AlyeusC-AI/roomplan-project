import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";

// GET /api/v1/saved-line-items/category/[category] - Get saved line items by category
export async function GET(
  req: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    const category = params.category;

    // Get all items in the category
    const { data: items, error } = await supabase
      .from("SavedLineItems")
      .select("*")
      .eq("category", category)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .order("description", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ items });
  } catch (error) {
    console.error(
      `API error getting saved line items for category ${params.category}:`,
      error
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
