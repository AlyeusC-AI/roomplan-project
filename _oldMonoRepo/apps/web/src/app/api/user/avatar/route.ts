import { createClient } from "@lib/supabase/server";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  try {
    const { data, error } = await supabaseServiceRole.storage
      .from("profile-pictures")
      .createSignedUrl(`${user.id}/avatar.png`, 3600);
    if (error || !data) {
      return NextResponse.json(
        { status: "failed", url: null },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: "ok", url: data?.signedUrl },
      { status: 200 }
    );
    return;
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
