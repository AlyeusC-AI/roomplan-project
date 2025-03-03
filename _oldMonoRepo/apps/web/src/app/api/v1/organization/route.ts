import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { user as getUser } from "@lib/supabase/get-user";
import { v4 } from "uuid";

const values = [
  {
    label: "Active",
    description: "The job is currently being worked on.",
    color: "blue",
    publicId: v4(),
    order: 0,
  },
  {
    label: "Mitigation",
    description: "The mitigation process is underway.",
    color: "blue",
    publicId: v4(),
    order: 1,
  },
  {
    label: "Inspection",
    description: "The inspection process is underway.",
    color: "yellow",
    publicId: v4(),
    order: 2,
  },
  {
    label: "Review",
    description: "The job is being finalized and is currently under review.",
    color: "orange",
    publicId: v4(),
    order: 3,
  },
  {
    label: "Completed",
    description: "The job is complete",
    color: "none",
    publicId: v4(),
    order: 4,
  },
  {
    label: "Inactive",
    description: "The job is no longer being worked on.",
    color: "none",
    publicId: v4(),
    order: 5,
  },
  {
    label: "Incomplete",
    description: "The job is not finished and is not being worked on",
    color: "red",
    publicId: v4(),
    order: 6,
  },
];

export async function POST(req: NextRequest) {
  const [, user] = await getUser(req);

  const body = await req.json();
  try {
    try {
      const { data } = await supabaseServiceRole
        .from("Organization")
        .insert({
          name: body.name,
          size: body.size,
          publicId: v4(),
          address: body.address,
          lat: body.lat,
          lng: body.lng,
          owner: user.id,
        })
        .select("*")
        .single();

      await supabaseServiceRole
        .from("User")
        .update({ organizationId: data?.publicId, accessLevel: "owner" })
        .eq("id", user.id);

      for (const value of values) {
        await supabaseServiceRole.from("ProjectStatusValue").insert({
          label: value.label,
          description: value.description,
          color: value.color,
          publicId: value.publicId,
          order: value.order,
          organizationId: data!.id,
        });
      }

      await supabaseServiceRole.auth.admin.updateUserById(user.id, {
        user_metadata: {
          organizationId: data!.publicId,
          role: "owner",
        },
      });
    } catch (error) {
      console.error("Could not create support user", error);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const supabaseClient = await createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const body: Partial<Organization> = await req.json();
  try {
    const { data: userData } = await supabaseClient
      .from("User")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data } = await supabaseClient
      .from("UserToOrganization")
      .select()
      .eq("userId", user.id)
      .single();

    if (!data) {
      console.error("User does not have an organization.");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    const isAllowed =
      data.isAdmin ||
      data.accessLevel === "admin" ||
      data.accessLevel === "accountManager" ||
      userData?.accessLevel === "owner" ||
      userData?.accessLevel === "admin" ||
      userData?.accessLevel === "accountManager";

    if (!isAllowed) {
      console.error("Not allowed");
      return NextResponse.json(
        {
          failed: true,
          reason: "not-allowed",
          message:
            "You do not have the necessary permissions to perform this action. Please contact your admin if you believe this is an error.",
        },
        { status: 403 }
      );
    }

    if (data.isDeleted) {
      console.error("org deleted");
      return NextResponse.json(
        {
          failed: true,
          reason: "no-org",
          message: "The organization has been deleted.",
        },
        { status: 404 }
      );
    }

    const res = await supabaseClient
      .from("Organization")
      .update(body)
      .eq("publicId", user.user_metadata.organizationId)
      .select("*")
      .single();

    return NextResponse.json(res.data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        status: "failed",
        message: "An unkown error ocurred. Please try again later",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function GET() {
  try {
    const client = await createClient();

    const organizationId: string = (await client.auth.getUser()).data.user
      ?.user_metadata.organizationId;

    if (!organizationId) {
      console.error("Organization does not exist.");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    console.log("organizationId", organizationId);

    const organization = await client
      .from("Organization")
      .select()
      .eq("publicId", organizationId)
      .single();

    if (organization.error) {
      console.error("Error fetching organization.", organization.error);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    if (!organization.data) {
      console.error("Organization does not exist.");
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    console.log("organization", organization.data);

    return NextResponse.json(organization.data, { status: 200 });
  } catch (error) {
    console.error("error", error);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
