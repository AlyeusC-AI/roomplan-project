import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await createClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user?.user_metadata.organizationId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await supabaseServiceRole
      .from("Organization")
      .select("id")
      .eq("publicId", user.user_metadata.organizationId)
      .single();

    console.log(result);
    console.log(user.user_metadata);

    if (!result.data) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data }: { data: Status[] | null } = await client
      .from("ProjectStatusValue")
      .select("*")
      .order("id", { ascending: true })
      .eq("organizationId", result.data.id);

    console.log(data);

    if (!data) {
      return NextResponse.json(
        { message: "No statuses found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
