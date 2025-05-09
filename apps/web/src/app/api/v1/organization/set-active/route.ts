import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { user } from "@lib/supabase/get-user";

export async function POST(req: NextRequest) {
  try {
    const [, authUser] = await user(req);
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Set the organization cookie
    const cookieStore = await cookies();
    cookieStore.set("organizationId", organizationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Error setting active organization:", error);
    return NextResponse.json(
      { error: "Failed to set active organization" },
      { status: 500 }
    );
  }
}
