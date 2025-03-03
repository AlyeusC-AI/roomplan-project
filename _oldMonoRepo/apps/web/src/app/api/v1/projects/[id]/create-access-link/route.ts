import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await user(req);
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const id = (await params).id;

  try {
    const { phoneNumber, email, expiresAt } = await req.json();

    const projectId = await supabaseServiceRole
      .from("Project")
      .select("id")
      .eq("publicId", id)
      .single();

    const accessId = crypto.randomBytes(64).toString("hex");

    const link = await supabaseServiceRole
      .from("PhotoAccessLink")
      .insert({
        projectId: projectId.data!.id,
        expiresAt,
        phoneNumber,
        email,
        accessId,
      })
      .select("*")
      .single();

    if (!link.data) {
      console.error("No link");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json(
      { status: "ok", linkId: link.data.accessId },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
