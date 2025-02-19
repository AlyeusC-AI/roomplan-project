import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const body = await req.json();

  try {
    const { costData, costId } = body;

    const result = await supabaseServiceRole
      .from("Cost")
      .update(costData)
      .eq("id", costId)
      .select("*")
      .single();

    return NextResponse.json({ status: "ok", cost: result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const { type } = await req.json();
  const id = (await params).id;

  try {
    const project = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", id)
      .single();

    const result = await supabaseServiceRole
      .from("Cost")
      .insert({
        projectId: project.data!.id,
        type,
      })
      .select("*")
      .single();

    return NextResponse.json(
      { status: "ok", cost: result.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const id = (await params).id;

  try {
    const { costId } = await req.json();

    const project = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", id)
      .single();

    await supabaseServiceRole
      .from("Cost")
      .delete()
      .eq("id", costId)
      .eq("projectId", project.data!.id);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Session does not exist.");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    const id = (await params).id;
    const project = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", id)
      .single();

    const result = await supabaseServiceRole
      .from("Cost")
      .select("*")
      .eq("projectId", project.data!.id);

    return NextResponse.json(
      { status: "ok", costs: result.data },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
