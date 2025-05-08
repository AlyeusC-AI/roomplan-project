import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Set the token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting auth token:", error);
    return NextResponse.json(
      { error: "Failed to set auth token" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear the auth cookie
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing auth token:", error);
    return NextResponse.json(
      { error: "Failed to clear auth token" },
      { status: 500 }
    );
  }
}
