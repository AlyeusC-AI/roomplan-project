import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await user(req);

    const { id } = await params;
    const reports = await supabaseServiceRole
      .from("PendingRoofReports")
      .select("*")
      .eq("isCompleted", false)
      .eq("isDeleted", false)
      .eq("projectId", id);

    return NextResponse.json(reports.data, { status: 200 });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
