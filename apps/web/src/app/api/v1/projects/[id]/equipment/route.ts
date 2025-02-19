import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await user(req);

    const { id } = await params;

    const projectId = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    const res: { data: ProjectEquipment[] | null } = await supabaseServiceRole
      .from("ProjectEquipment")
      .select("*, Equipment(*)")
      .eq("isDeleted", false)
      .eq("projectId", projectId.data!.id);

    console.log(res.data);

    return NextResponse.json(res.data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await user(req);

    const { projectId, equipmentId } = await req.json();

    const fetchRes = await supabaseServiceRole
      .from("ProjectEquipment")
      .select("*")
      .eq("projectId", projectId)
      .eq("equipmentId", equipmentId);

    if (fetchRes.data && fetchRes.data.length > 0) {
      await supabaseServiceRole
        .from("ProjectEquipment")
        .update({ isDeleted: false })
        .eq("id", fetchRes.data[0].id);

      return NextResponse.json({ message: "Equipment added successfully" });
    }

    const res = await supabaseServiceRole
      .from("ProjectEquipment")
      .insert({ projectId, equipmentId, publicId: v4() })
      .select("*, Equipment(*)")
      .single();

    if (res.error) {
      console.error(res.error);
    }

    return NextResponse.json(res.data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await user(req);

    const { equipmentId } = await req.json();

    const res = await supabaseServiceRole
      .from("ProjectEquipment")
      .update({ isDeleted: true })
      .eq("id", equipmentId);

    if (res.error) {
      console.error(res.error);
    }

    return NextResponse.json({ message: "Equipment deleted successfully" });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
