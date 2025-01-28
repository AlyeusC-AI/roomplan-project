import createInvitation from "@servicegeek/db/queries/organization/createInvitation";
import createOrg from "@servicegeek/db/queries/user/createOrg";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseClient = await createClient();
  const jwt = req.headers.get("auth-token");

  let user: User | null = null;

  if (jwt && typeof jwt === "string") {
    user = (await supabaseClient.auth.getUser(jwt)).data.user;
  } else {
    user = (await supabaseClient.auth.getUser()).data.user;
  }
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const body = await req.json();
  try {
    const org = await createOrg(user.id, body.orgName, body.orgSize, body.role);
    try {
      const supportUser = `support+${org.org?.organization.publicId}@servicegeek.app`;
      const invitation = await createInvitation(user.id, supportUser);
      await supabaseServiceRole.auth.admin.inviteUserByEmail(supportUser, {
        data: {
          orgId: invitation.orgId,
          inviteId: invitation.inviteId,
          isSupportUser: true,
          firstName: "ServiceGeek",
          lastName: "Support",
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
  const body = await req.json();
  try {
    const { name, address } = body as { name: string; address: AddressType };

    if (name.length < 3 || name.length > 50) {
      console.error("Invalid name.");
      return NextResponse.json(
        {
          failed: true,
          reason: "invalid-name",
          message:
            "Invalid name. Your organization name must be between 3 and 50 characters.",
        },
        { status: 400 }
      );
    }

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
      data.accessLevel === "accountManager";

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

    if (!name && !address) {
      console.error("invalid data");
      return NextResponse.json(
        { failed: true, reason: "invalid data", message: "Invalid data." },
        { status: 400 }
      );
    }

    const res = await supabaseClient
      .from("Organization")
      .update({
        ...(name ? { name } : {}),
        ...(address
          ? { address: address.address, lat: address.lat, lng: address.lng }
          : {}),
      })
      .eq("publicId", user.user_metadata.organizationId)
      .select();

    console.log(res);
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
