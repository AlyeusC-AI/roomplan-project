import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import { parse } from "csv-parse/sync";
import crypto from "crypto";

// POST /api/v1/saved-line-items/import - Import saved line items from CSV
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user with the user function
    const [supabase, authenticatedUser] = await user(req);

    // Get CSV content from request body
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: "Only CSV files are supported" }, { status: 400 });
    }

    // Parse CSV content
    const csvContent = await file.text();
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validate records
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "No valid records found" }, { status: 400 });
    }

    // Transform records into line item objects
    const lineItems = records.map((record: any) => ({
      publicId: crypto.randomUUID(),
      userId: authenticatedUser.id,
      organizationId: authenticatedUser.user_metadata.organizationId,
      name: record.Name || record.name || "",
      description: record.Description || record.description || "",
      rate: parseFloat(record.Rate || record.rate) || 0,
      category: record.Category || record.category || "",
      isDeleted: false,
    }));

    // Skip items with missing required fields
    const validItems = lineItems.filter(item => 
      item.description && !isNaN(item.rate) && item.rate > 0
    );

    if (validItems.length === 0) {
      return NextResponse.json({ error: "No valid items found in CSV" }, { status: 400 });
    }

    // Insert items into database
    const { data, error } = await supabase
      .from("SavedLineItems")
      .insert(validItems)
      .select();

    if (error) {
      console.error("Error importing items:", error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      imported: validItems.length,
      total: records.length
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import data" }, 
      { status: 500 }
    );
  }
} 