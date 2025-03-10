import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);
  const { status } = await req.json();
  const id = (await params).id;

  try {
    await supabaseServiceRole
      .from("Project")
      .update({
        status,
        closedAt: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("publicId", id);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
