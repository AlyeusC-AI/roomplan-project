import { createClient } from "@lib/supabase/server";
import updateRoomName from "@servicegeek/db/queries/room/updateRoomName";
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
    if (!body.name || body.name === "" || body.name.trim() === "") {
      return NextResponse.json(
        { status: "failed", reason: "missing name" },
        { status: 400 }
      );
    }
    const result = await updateRoomName(user.id, id, body.roomId, body.name);
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
