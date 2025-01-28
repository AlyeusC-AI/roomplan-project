import { createClient } from "@lib/supabase/server";
import createPhotoAccessLink from "@servicegeek/db/queries/photo-access-link/createPhotoAccessLink";
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

  const id = (await params).id;

  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    const { phoneNumber, email, expiresAt } = await req.json();
    const accessLink = await createPhotoAccessLink(user.id, {
      projectPublicId: id,
      expiresAt,
      phoneNumber,
      email,
    });
    if (!accessLink) {
      console.error("No link");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json(
      { status: "ok", linkId: accessLink.accessId },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
