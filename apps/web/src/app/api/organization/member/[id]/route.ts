import removeMember from "@servicegeek/db/queries/organization/removeMember";
import updateAccessLevel from "@servicegeek/db/queries/organization/updateAccessLevel";
import { AccessLevel } from "@servicegeek/db";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseClient = await createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!user || !session?.access_token) {
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
    const result = await removeMember(user.id, id);
    if (result.failed) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseClient = await createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!user || !session?.access_token) {
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
    const body = JSON.parse(await req.json()) as { accessLevel: AccessLevel };
    const { accessLevel } = body;
    if (!accessLevel) {
      return NextResponse.json(
        { status: "failed", reason: "invalid access level" },
        { status: 400 }
      );
    }
    const result = await updateAccessLevel(user.id, id, accessLevel);
    if (!result) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
