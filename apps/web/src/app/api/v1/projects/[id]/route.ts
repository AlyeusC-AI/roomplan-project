import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);

  const id = (await params).id;
  const isIdNumber = !isNaN(Number(id));


  try {
    const projectRaw: { data: FlatProject | null } = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq(isIdNumber ? "id" : "publicId", id)
      .single();

    const project: Project = {
      ...projectRaw.data!,
      images: [],
      assignees: [],
    };

    const assignees = await supabaseServiceRole
      .from("UserToProject")
      .select("*, User (firstName, lastName, email)")
      .eq("projectId", project.id);

    project.assignees = assignees.data ?? [];

    return NextResponse.json({
      status: "ok",
      data: project,
    });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);

  const id = (await params).id;

  const body = await req.json();

  try {
    const project = await supabaseServiceRole
      .from("Project")
      .update(body)
      .eq("publicId", id)
      .select("*")
      .single();

    console.log(project.data);

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
