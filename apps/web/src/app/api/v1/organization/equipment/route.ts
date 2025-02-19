import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const org = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    const equipment = await supabaseServiceRole
      .from("Equipment")
      .select("*")
      .eq("organizationId", org.data!.id);

    return NextResponse.json({ equipment: equipment.data });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const org = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    const { name } = await req.json();

    const equipment = await supabaseServiceRole
      .from("Equipment")
      .insert({ name, organizationId: org.data!.id, publicId: v4() })
      .select("*")
      .single();

    return NextResponse.json({ equipment: equipment.data });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const org = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    const { name, equipmentId } = await req.json();

    const equipment = await supabaseServiceRole
      .from("Equipment")
      .update({ name })
      .eq("publicId", equipmentId)
      .eq("organizationId", org.data!.id)
      .select("*")
      .single();

    return NextResponse.json({ equipment: equipment.data });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const org = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    const { equipmentId } = await req.json();

    await supabaseServiceRole
      .from("Equipment")
      .update({ isDeleted: true })
      .eq("publicId", equipmentId)
      .eq("organizationId", org.data!.id);

    return NextResponse.json({});
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
