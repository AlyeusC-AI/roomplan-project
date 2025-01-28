import { createClient } from "@lib/supabase/server";
import createRoomNote from "@servicegeek/db/queries/room/notes/createRoomNote";
import deleteRoomNote from "@servicegeek/db/queries/room/notes/deleteRoomNote";
import updateRoomNote from "@servicegeek/db/queries/room/notes/updateRoomNote";
import { NextRequest, NextResponse } from "next/server";

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
    if (!body.body) {
      return NextResponse.json(
        { status: "failed", reason: "missing body" },
        { status: 400 }
      );
    }
    const result = await updateRoomNote(
      user.id,
      id,
      body.roomId,
      body.noteId,
      body.body
    );
    // @ts-expect-error
    if (result?.failed) {
      console.log(result);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok", result }, { status: 200 });
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
  const body = await req.json();
  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const result = await createRoomNote(user.id, id, body.roomId, body.body);
    console.log("room created", result);
    // @ts-expect-error
    if (result?.failed) {
      console.log(result);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok", result }, { status: 200 });
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
    const result = await deleteRoomNote(user.id, id, body.roomId, body.noteId);
    // @ts-expect-error
    if (result?.failed) {
      console.log(result);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
