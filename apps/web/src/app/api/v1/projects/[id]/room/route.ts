import { createClient } from "@lib/supabase/server";
import createRoom from "@servicegeek/db/queries/room/createRoom";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwt = req.headers.get("auth-token");
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: "Missing token" }, { status: 500 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt);
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
      { status: "ok", publicId: room.publicId },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
