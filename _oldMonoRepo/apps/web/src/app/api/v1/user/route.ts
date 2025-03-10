import { createClient } from "@lib/supabase/server";

import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const headers = req.headers;
  const jwt = headers.get("auth-token");
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: "Missing token" }, { status: 500 });
  }
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt);
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  try {
    await supabase
      .from("User")
      .update({
        isDeleted: true,
      })
      .eq("id", user.id);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const data = await req.json();
  console.log("🚀 ~ PATCH ~ data:", data);

  try {
    await supabase.from("User").update(data).eq("id", user.id);

    // await updateUser({ id: user.id, firstName, lastName, phone });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function GET() {
  try {
    const supabaseClient = await createClient();

    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    if (!authUser) {
      return NextResponse.redirect("/login");
    }

    // const user = await prisma.user.findFirst({
    //   where: { id: authUser.id },
    //   select: {
    //     id: true,
    //     firstName: true,
    //     lastName: true,
    //     email: true,
    //     inviteId: true,
    //     phone: true,
    //     isDeleted: true,
    //     isSupportUser: true,
    //     hasSeenProductTour: true,
    //     productTourData: true,
    //     savedDashboardView: true,
    //     photoView: true,
    //     groupView: true,
    //     org: {
    //       select: {
    //         id: true,
    //         role: true,
    //         accessLevel: true,
    //         isAdmin: true,
    //         organizationId: true,
    //         isDeleted: true,
    //       },
    //     },
    //   },
    // });

    const { data: user } = await supabaseClient
      .from("User")
      .select("*, UserToOrganization ( isDeleted, accessLevel, isAdmin )")
      .eq("id", authUser.id)
      .single();

    if (!user) {
      return NextResponse.redirect("/login");
    }

    const role = user.UserToOrganization.find((_, i) => i === 0);

    if (
      (!(role && role.accessLevel) || role?.isDeleted === true) &&
      !user.accessLevel
    ) {
      return NextResponse.redirect("/access-revoked");
    }

    console.log("user", user);
    return NextResponse.json(
      {
        ...user,
        emailConfirmed: authUser.email_confirmed_at != null,
        isAdmin:
          role?.isAdmin ||
          user.accessLevel === "admin" ||
          user.accessLevel === "owner",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error", error);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
