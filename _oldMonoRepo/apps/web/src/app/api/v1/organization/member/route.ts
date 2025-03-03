import { NextRequest, NextResponse } from "next/server";
import { user } from "@lib/supabase/get-user";
import { supabaseServiceRole } from "@lib/supabase/admin";

export async function DELETE(req: NextRequest) {
  const [, authUser] = await user(req);

  try {
    const dbUser = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (
      dbUser.data?.accessLevel !== "admin" &&
      dbUser.data?.accessLevel !== "accountManager" &&
      dbUser.data?.accessLevel !== "owner"
    ) {
      return NextResponse.json(
        { status: "failed", reason: "not-allowed" },
        { status: 403 }
      );
    }

    const { userId } = await req.json();

    await supabaseServiceRole
      .from("User")
      .update({ removed: true })
      .eq("id", userId);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const [, authUser] = await user(req);

  try {
    const { userId, accessLevel } = await req.json();

    const dbUser = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (
      dbUser.data?.accessLevel !== "admin" &&
      dbUser.data?.accessLevel !== "accountManager" &&
      dbUser.data?.accessLevel !== "owner"
    ) {
      return NextResponse.json(
        { status: "failed", reason: "not-allowed" },
        { status: 403 }
      );
    }

    await supabaseServiceRole
      .from("User")
      .update({ accessLevel })
      .eq("id", userId);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
