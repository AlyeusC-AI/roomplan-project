import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; roomId: string } }
) {
  try {
    await user(req);
    const { roomId } = params;

    const room = await supabaseServiceRole
      .from("Room")
      .select("name, id")
      .eq("publicId", roomId)
      .single();

    if (!room.data) {
      return NextResponse.json(
        { status: "failed", reason: "room-not-found" },
        { status: 404 }
      );
    }

    const { name, id: roomRawId } = room.data;

    // Update all related records to be deleted
    await supabaseServiceRole
      .from("Detection")
      .update({ isDeleted: true })
      .eq("roomId", roomRawId);

    const { data: inferenceData } = await supabaseServiceRole
      .from("Inference")
      .update({ isDeleted: true })
      .eq("roomId", roomRawId)
      .select("imageId");
    console.log("🚀 ~ inferenceData:", inferenceData);

    await supabaseServiceRole
      .from("Room")
      .update({ isDeleted: true, name: `${roomId}-${name}` })
      .eq("publicId", roomId);

    await supabaseServiceRole
      .from("Image")
      .update({ isDeleted: true })
      .in("id", inferenceData?.map((i) => i.imageId) ?? []);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
