import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getInvoicesByProject } from "@/lib/invoices";

// GET - Retrieve all invoices for a specific project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: projectId } = await params;

    // Get invoices for the project
    // Authorization is handled by RLS policies
    const invoices = await getInvoicesByProject(projectId);

    return NextResponse.json({ invoices }, { status: 200 });
  } catch (error) {
    const { id: projectId } = await params;
    console.error(`Error in GET /api/v1/projects/${projectId}/invoices`, error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error fetching project invoices";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
