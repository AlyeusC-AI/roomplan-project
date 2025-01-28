import { createClient } from "@lib/supabase/server";
import updateProjectInformation from "@servicegeek/db/queries/organization/updateProjectInformation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: "failed", reason: "invalid query param" },
      { status: 400 }
    );
  }

  try {
    await updateProjectInformation(
      user.id,
      id,
      body.projectName,
      body.projectManagerName,
      body.companyName,
      body.roofSegments,
      body.roofSpecs
    );

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
