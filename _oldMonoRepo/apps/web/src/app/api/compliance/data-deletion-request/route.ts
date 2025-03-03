import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const { email, fullName } = body;
    await supabaseServiceRole
      .from("DataDeletionRequest")
      .insert([{ email, fullName }]);

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error" });
  }
}
