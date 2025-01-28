import { createClient } from "@lib/supabase/server";
import setProjectStatus from "@servicegeek/db/queries/project/setProjectStatus";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const body = await req.json();
  const id = (await params).id;

  try {
    const result = await setProjectStatus(user.id, id, body.status);
    if (result?.failed) {
      console.log(result);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }
    return NextResponse.json({ status: "ok", result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is logged in
    if (!user) {
      console.error("Session does not exist.");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    // Check if user has an organization
    if (!user.user_metadata.organizationId) {
      console.error("User has no organization.");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    // Get request body
    const body = await req.json();

    const data = await supabase
      .from("ProjectStatusValue")
      .insert({
        label: body.label,
        description: body.description,
        color: body.color,
        organizationId: user.user_metadata.organizationId,
        publicId: v4(),
      })
      .select("*");

    return NextResponse.json(
      { status: "ok", data: data.data },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse | never> {
  let redirectPath = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
  } catch (error) {
    if (error instanceof Error) {
      redirectPath = error.message;
    } else {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }
  } finally {
    if (redirectPath) {
      return redirect(redirectPath);
    }
  }
}
