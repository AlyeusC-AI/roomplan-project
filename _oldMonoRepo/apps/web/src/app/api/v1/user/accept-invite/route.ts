import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  await user(req);

  const { firstName, lastName, inviteId, phone, password } = await req.json();

  if (!firstName && !lastName && !phone) {
    return NextResponse.json(
      {
        status: "failed",
        message: "firstName and lastName and phone must be provided.",
      },
      { status: 500 }
    );
    return;
  }
  try {
    console.log("phone", phone);

    const newU = await supabaseServiceRole.from("User").update({
      phone,
      lastName,
      firstName,
      inviteId,
    });

    await supabaseServiceRole
      .from("OrganizationInvitation")
      .update({ isAccepted: true })
      .eq("id", inviteId);

    return NextResponse.json({ status: "ok", user: newU }, { status: 200 });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
