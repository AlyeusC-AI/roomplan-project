import { createClient } from "@lib/supabase/server";
import { prisma } from "@servicegeek/db";
import updateUser from "@servicegeek/db/queries/user/updateUser";
import { redirect } from "next/navigation";

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
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isDeleted: true,
      },
    });

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

  const { firstName, lastName, phone } = await req.json();
  if (!firstName && !lastName && !phone) {
    return NextResponse.json(
      { status: "failed", message: "firstName and lastName must be provided." },
      { status: 500 }
    );
  }
  try {
    supabase.auth.updateUser({
      data: {
        firstName,
        lastName,
        phone,
      },
    });

    await updateUser({ id: user.id, firstName, lastName, phone });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function GET() {
  let redirectPath = null;
  try {
    const supabaseClient = await createClient();

    const {
      data: { user: authUser },
    } = await supabaseClient.auth.getUser();

    if (!authUser) {
      throw new Error("/login");
    }

    const user = await prisma.user.findFirst({
      where: { id: authUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        inviteId: true,
        phone: true,
        isDeleted: true,
        isSupportUser: true,
        hasSeenProductTour: true,
        productTourData: true,
        savedDashboardView: true,
        photoView: true,
        groupView: true,
        org: {
          select: {
            id: true,
            role: true,
            accessLevel: true,
            isAdmin: true,
            organizationId: true,
            isDeleted: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("/login");
    }

    if (!user.org) {
      throw new Error("/organization");
    }

    if (!user.org.accessLevel || user.org.isDeleted) {
      throw new Error("/access-revoked");
    }
    return NextResponse.json(
      {
        ...user,
        emailConfirmed: authUser.email_confirmed_at != null,
        accessLevel: user.org.accessLevel,
        isAdmin: user.org.isAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error", error);
    if (error instanceof Error) {
      redirectPath = error.message;
    }
  } finally {
    if (redirectPath) {
      return redirect(redirectPath);
    }
  }
}
