import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const [, authUser] = await user(req);
    const organization = await supabaseServiceRole
      .from("Organization")
      .select("*")
      .eq("publicId", authUser.user_metadata.organizationId)
      .single();

    if (!organization.data) {
      return NextResponse.redirect("/projects");
    }

    const data = await supabaseServiceRole
      .from("ProjectStatusValue")
      .select("*")
      .eq("organizationId", organization.data.id);

    return NextResponse.json(
      { status: "ok", data: data.data },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const organization = await supabaseServiceRole
      .from("Organization")
      .select("*")
      .eq("publicId", authUser?.user_metadata.organizationId)
      .single();

    if (!organization.data) {
      return NextResponse.redirect("/projects");
    }

    const { label, color } = await req.json();

    const { data, error } = await supabaseServiceRole
      .from("ProjectStatusValue")
      .insert({
        label,
        color,
        description: "",
        publicId: v4(),
        organizationId: organization.data.id,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "ok", data: data }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const [, authUser] = await user(req);

    const organization = await supabaseServiceRole
      .from("Organization")
      .select("*")
      .eq("publicId", authUser?.user_metadata.organizationId)
      .single();

    if (!organization.data) {
      return NextResponse.redirect("/projects");
    }

    const { publicId, order, ...body } = await req.json();

    let savedData: Status | null;

    if (order) {
      const updates = order.map(
        ({ index, publicId }: { index: number; publicId: string }) =>
          supabaseServiceRole
            .from("ProjectStatusValue")
            .update({
              order: index,
            })
            .eq("publicId", publicId)
      );

      savedData = null;

      await Promise.all(updates);
    } else {
      const { data, error } = await supabaseServiceRole
        .from("ProjectStatusValue")
        .update(body)
        .eq("publicId", publicId)
        .single();

      if (error) {
        return NextResponse.json({ status: "failed" }, { status: 500 });
      }

      savedData = data;
    }

    return NextResponse.json(
      {
        status: "ok",
        data: savedData,
      },
      {
        status: 200,
      }
    );
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
