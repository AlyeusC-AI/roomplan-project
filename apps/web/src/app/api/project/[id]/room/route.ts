import { createClient } from "@lib/supabase/server";
import updateRoomForInference from "@servicegeek/db/queries/inference/updateRoomForInference";
import createRoom from "@servicegeek/db/queries/room/createRoom";
import deleteRoom from "@servicegeek/db/queries/room/deleteRoom";
import { NextRequest, NextResponse } from "next/server";

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
  const body = await req.json();
  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const room = await createRoom(user.id, id, body.room);
    // @ts-expect-error
    if (room.failed) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }
    return NextResponse.json(
      // @ts-expect-error
      { status: "ok", publicId: room.publicId },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(
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
  const body = await req.json();
  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const keys = body.imageKeys as string[];
    for (const key of keys) {
      const result = await updateRoomForInference(key, body.roomId, user.id);
      if (result?.failed) {
        console.log(result);
        return NextResponse.json({ status: "failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ status: "ok" });
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
  const body = await req.json();
  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteRoom(user.id, id, body.roomId);
    // @ts-expect-error
    if (result?.failed) {
      console.log(result);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
