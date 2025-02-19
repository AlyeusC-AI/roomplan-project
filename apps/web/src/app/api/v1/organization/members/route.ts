import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    if (!authUser) {
      console.error("Session does not exist.");
      return NextResponse.json(
        { status: "Session does not exist" },
        { status: 500 }
      );
    }

    const data = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("organizationId", authUser.user_metadata.organizationId)
      .neq("isSupportUser", true);

    return NextResponse.json({ status: "ok", members: data.data });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
