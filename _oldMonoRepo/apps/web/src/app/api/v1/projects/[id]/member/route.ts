import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);

  const id = (await params).id;

  const body = await req.json();

  try {
    const { userId } = body;

    const projectId = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    const user = await supabaseServiceRole
      .from("UserToProject")
      .insert({
        userId,
        projectId: projectId.data!.id,
      })
      .select("*")
      .single();

    return NextResponse.json(
      { status: "ok", user: user.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);
  const id = (await params).id;

  try {
    const projectId = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    const users = await supabaseServiceRole
      .from("UserToProject")
      .select("*, User(email,firstName,lastName,phone)")
      .eq("projectId", projectId.data!.id);

    return NextResponse.json({ users: users.data }, { status: 200 });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);
  const id = (await params).id;

  const body = await req.json();

  try {
    const { userId } = body;

    const projectId = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    await supabaseServiceRole
      .from("UserToProject")
      .delete()
      .eq("userId", userId)
      .eq("projectId", projectId.data!.id);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
