import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);
  const body = await req.json();
  const id = (await params).id;

  try {
    if (!body.affectedAreaData) {
      return NextResponse.json(
        { status: "failed", reason: "missing affectedAreaData" },
        { status: 400 }
      );
    }

    const projectId = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    let areaAffected: AreaAffected | null;

    if (!body.affectedAreaData.id) {
      const { data: room } = await supabaseServiceRole
        .from("Room")
        .select("id")
        .eq("publicId", body.roomId)
        .single();

        const { data: existingArea } = await supabaseServiceRole
        .from("AreaAffected")
        .select("*")
        .eq("roomId", room!.id)
        .eq("type", body.type)
        .single();

      if (existingArea) {
        return NextResponse.json({ status: "ok", areaAffected: existingArea }, { status: 200 });
      }

      const result = await supabaseServiceRole
        .from("AreaAffected")
        .insert({
          publicId: v4(),
          projectId: projectId.data!.id,
          roomId: room!.id,
          type: body.type,
        })
        .select("*")
        .single();
      console.log("🚀 ~ result:", result);

      areaAffected = result.data;
    } else {
      const result = await supabaseServiceRole
        .from("AreaAffected")
        .update(body.affectedAreaData)
        .eq("id", body.affectedAreaData.id)
        .select("*")
        .single();

      areaAffected = result.data;
    }
    // const result = await updateOrCreateRoomAffectedArea(
    //   user.id,
    //   id,
    //   body.roomId,
    //   body.affectedAreaData,
    //   body.type
    // );

    return NextResponse.json({ status: "ok", areaAffected }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
