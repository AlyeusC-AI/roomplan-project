import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import { stringify } from "csv-stringify/sync";

// GET /api/v1/saved-line-items/export - Export saved line items as CSV
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    // Parse query parameters for optional category filter
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    // Build query
    let query = supabase
      .from("SavedLineItems")
      .select("*")
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .order("name", { ascending: true });

    // Apply category filter if provided
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Execute query
    const { data: items, error } = await query;

    if (error) throw error;

    // Transform data for CSV export (removing unnecessary fields)
    const csvData = items.map((item) => ({
      name: item.name || "",
      description: item.description,
      rate: item.rate,
      category: item.category || "",
    }));

    // Generate CSV
    const csv = stringify(csvData, {
      header: true,
      columns: {
        name: "Name",
        description: "Description",
        rate: "Rate",
        category: "Category",
      },
    });

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `saved-line-items-${timestamp}.csv`;

    // Return CSV as a download
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
