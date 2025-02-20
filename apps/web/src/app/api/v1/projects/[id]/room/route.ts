import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { createClient } from "@lib/supabase/server";
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
    const project = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id);

    const existingRoom = await supabaseServiceRole
      .from("Room")
      .select()
      .eq("name", body.name)
      .eq("projectId", project.data![0].id);

    if ((existingRoom.data?.length ?? 0) > 0) {
      return NextResponse.json(
        { status: "failed", reason: "existing-room" },
        { status: 400 }
      );
    }

    const room = await supabaseServiceRole
      .from("Room")
      .insert({
        projectId: project.data![0].id,
        name: body.name,
        publicId: v4(),
      })
      .select("*")
      .single();

    return NextResponse.json(
      { status: "ok", room: room.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const { roomId, ...data } = await req.json();

  try {
    const res = await supabaseServiceRole
      .from("Room")
      .update(data)
      .eq("publicId", roomId);
    // const keys = body.imageKeys as string[];
    // for (const key of keys) {
    //   const result = await updateRoomForInference(key, body.roomId, user.id);
    //   if (result?.failed) {
    //     console.log(result);
    //     return NextResponse.json({ status: "failed" }, { status: 500 });
    //   }
    // }

    if (res.error) {
      console.error(res.error);
    }

    return NextResponse.json({ status: "ok" });
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
    await user(req);

    const id = (await params).id;

    const project = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id);

    const rooms: { data: RoomWithReadings[] | null; error: unknown } =
      await supabaseServiceRole
        .from("Room")
        .select(
          "*, Inference (*, Image (*)), Notes (*, NotesAuditTrail (*)), AreaAffected (*), RoomReading (*, GenericRoomReading (*))"
        )
        .eq("isDeleted", false)
        .eq("RoomReading.isDeleted", false)
        .eq("RoomReading.GenericRoomReading.isDeleted", false)
        .eq("Notes.isDeleted", false)
        .eq("projectId", project.data![0].id);

    if (rooms.error || !rooms.data) {
      console.error(rooms.error);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    console.log(rooms.data);

    return NextResponse.json(
      {
        status: "ok",
        rooms: rooms.data,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
