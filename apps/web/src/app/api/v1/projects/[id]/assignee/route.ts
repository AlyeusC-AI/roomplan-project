import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await user(req);

    const { id } = await params;

    const { userId } = await req.json();

    const project = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    const userObj = await supabaseServiceRole
      .from("UserToProject")
      .insert({
        projectId: project.data!.id,
        userId: userId,
      })
      .select("*, User (firstName, lastName, email)")
      .single();

    return NextResponse.json(
      { status: "ok", assignee: userObj.data },
      { status: 200 }
    );
  } catch {
    NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await user(req);

    const { id } = await params;

    const { userId } = await req.json();

    const project = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    await supabaseServiceRole
      .from("UserToProject")
      .delete()
      .eq("projectId", project.data!.id)
      .eq("userId", userId);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
