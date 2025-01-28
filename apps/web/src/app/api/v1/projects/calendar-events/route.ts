import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
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
    const results = await supabaseServiceRole
      .from("CalendarEvent")
      .select("*")
      .eq("organizationId", user.user_metadata.organizationId);
    if (!results) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
