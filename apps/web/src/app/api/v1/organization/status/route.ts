import { createClient } from "@lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const organization = await supabase
      .from("Organization")
      .select("*")
      .eq("publicId", user?.user_metadata.organizationId)
      .single();

    if (!organization.data) {
      return NextResponse.redirect("/projects");
    }

    const data = await supabase
      .from("ProjectStatusValue")
      .select("*")
      .eq("organizationId", organization.data.id);

    return NextResponse.json(
      { status: "ok", data: data.data },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
