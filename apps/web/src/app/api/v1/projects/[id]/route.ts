import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const jwt = req.headers.get("auth-token");

  await supabase.auth.getUser(jwt ?? undefined);

  const id = (await params).id;
  console.log("id", id);

  try {
    const project = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", "f8877dc3-cf9d-42ee-8a89-37d0623243b9")
      .single();

    if (project.error) {
      console.log("project.error", project.error);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      data: project.data,
    });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
