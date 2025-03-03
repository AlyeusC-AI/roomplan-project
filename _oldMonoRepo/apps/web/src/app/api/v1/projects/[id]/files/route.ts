import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [, authUser] = await user(req);
    const { id } = await params;
    const { data } = await supabaseServiceRole.storage
      .from("user-files")
      .list(`${authUser.user_metadata.organizationId}/${id}/`, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await user(req);
    const { filename } = await req.json();

    const { error } = await supabaseServiceRole.storage
      .from("user-files")
      .remove([filename]);

    if (error) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
