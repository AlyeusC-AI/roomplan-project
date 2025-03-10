import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  try {
    await user(req);
    const id = (await params).roomId;

    const room = await supabaseServiceRole
      .from("Room")
      .select("id, projectId")
      .eq("publicId", id);

    const reading = await supabaseServiceRole
      .from("RoomReading")
      .insert({
        roomId: room.data![0].id,
        publicId: v4(),
        projectId: room.data![0].projectId,
      })
      .select("*")
      .single();

    return NextResponse.json(
      { status: "success", reading: reading.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  try {
    await user(req);
    const id = (await params).roomId;
    const body = await req.json();

    const room = await supabaseServiceRole
      .from("Room")
      .select("id, projectId")
      .eq("publicId", id);

    const reading = await supabaseServiceRole
      .from("RoomReading")
      .update(body)
      .eq("publicId", body.readingPublicId)
      .eq("projectId", room.data![0].projectId)
      .eq("roomId", room.data![0].id)
      .select("*")
      .single();

    return NextResponse.json(
      { status: "success", reading: reading.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  try {
    await user(req);
    const results = await supabaseServiceRole
      .from("RoomReading")
      .select("*")
      .eq("roomId", (await params).roomId);

    const generics = await supabaseServiceRole
      .from("GenericRoomReading")
      .select("*")
      .eq("roomId", (await params).roomId);
    return NextResponse.json(
      { status: "success", rooms: results.data, generics: generics.data },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
