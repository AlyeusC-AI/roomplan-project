import { createClient } from "@lib/supabase/server";
import createGenericRoomReading from "@servicegeek/db/queries/room/generic-reading/createGenericRoomReading";
import deleteGenericRoomReading from "@servicegeek/db/queries/room/generic-reading/deleteGenericRoomReading";
import updateGenericRoomReading from "@servicegeek/db/queries/room/generic-reading/updateGenericRoomReading";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
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

  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const result = await updateGenericRoomReading(
      user.id,
      id,
      // @ts-expect-error
      req.query.roomId,
      req.query.readingId,
      req.query.genericRoomReadingId,
      req.query.value,
      req.query.temperature || "",
      req.query.humidity || ""
    );
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

  const id = (await params).id;
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  const roomId = req.nextUrl.searchParams.get("roomId");
  const readingId = req.nextUrl.searchParams.get("readingId");
  const type = req.nextUrl.searchParams.get("type");

  try {
    const result = await createGenericRoomReading(
      user.id,
      id,
      roomId!,
      readingId!,
      type!
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

export async function DELETE(
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
    const result = await deleteGenericRoomReading(
      user.id,
      id,
      body.roomId,
      body.readingId,
      body.genericReadingId
    );
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
