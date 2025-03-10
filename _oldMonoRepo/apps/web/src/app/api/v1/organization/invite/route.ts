import { getStripePriceFromClientID } from "unused/stripe/getStripePriceFromClientID";
import { supabaseServiceRole } from "@lib/supabase/admin";
import Stripe from "stripe";
import validator from "validator";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import createInvitation from "./createInvitation";

// import { NextResponse } from "next/server";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-01-27.acacia",
// });

export async function POST(req: NextRequest) {
  const supabaseClient = await createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  console.log("🚀 ~ POST ~ user:", user);

  const orgId = user?.user_metadata.organizationId;
  console.log("🚀 ~ POST ~ orgId:", orgId);
  if (!orgId) {
    console.error("err", "no org");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  // Get organization details
  // const { data: currentTeamMembers } = await supabaseClient
  //   .from("User")
  //   .select("*")
  //   .eq("organizationId", orgId)
  //   .single();
  // console.log("🚀 ~ POST ~ org:", currentTeamMembers);

  const body = await req.json();

  if (!validator.isEmail(body.email)) {
    console.error("Invalid email.");
    return NextResponse.json({ status: "failed", message: "invalid-email" });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_JWT) {
    console.error("No service role key");
    return NextResponse.json({ status: "failed", message: "no-service-role" });
  }
  try {
    const invitation = await createInvitation(user.id, body.email);
    console.log("🚀 ~ POST ~ invitation:", invitation);
    if (invitation.failed) {
      if (invitation.reason === "existing-invite")
        return NextResponse.json(
          { status: "failed", message: "existing-invite" },
          { status: 400 }
        );
      else if (invitation.reason === "existing-member")
        return NextResponse.json(
          { status: "failed", message: "existing-member" },
          { status: 400 }
        );
      else return NextResponse.json({ status: "failed" }, { status: 500 });
    } else {
      console.log("🚀 ~ POST ~ invitation:", invitation);
      console.log("🚀 ~ POST ~ orgId:", orgId);

      const { data: u, error } =
        await supabaseServiceRole.auth.admin.inviteUserByEmail(body.email, {
          data: {
            organizationId: orgId,
            inviteId: invitation.inviteId,
            isSupportUser: false,
            firstName: "",
            lastName: "",
            accessLevel: "viewer",
          },
          redirectTo: `${process.env.DOMAIN || "http://localhost:3002"}/acceptInvite?token=${invitation.inviteId}`,
        });
      console.log("🚀 ~ POST ~ error:", error);
      if (process.env.NODE_ENV === "production") {
        await fetch(
          "https://hooks.slack.com/services/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",
          {
            method: "POST",
            body: JSON.stringify({
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: "New user invite :wave:",
                  },
                },
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `• email: ${body.email} • platform: web \n`,
                  },
                },
              ],
            }),
          }
        );
      }

      // const { data: subscription } = await supabaseClient
      //   .from("Subscriptions")
      //   .select("*")
      //   .eq("organizationId", orgId)
      //   .eq("status", "active")
      //   .single();

      // if (subscription) {
      //   const subItems = await stripe.subscriptionItems.list({
      //     subscription: subscription.id,
      //   });
      //   await stripe.subscriptions.update(subscription.id, {
      //     items: [
      //       {
      //         id: subItems.data[0].id,
      //         price: getStripePriceFromClientID("basic"),
      //         quantity: currentTeamMembers.length + 1,
      //       },
      //     ],
      //   });
      // }

      if (error) {
        console.log(error);
        return NextResponse.json(
          { status: "failed", message: error.message },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { status: "ok", userId: u?.user.id },
          { status: 200 }
        );
      }
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabaseClient = await createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    console.error("Session does not exist.");
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
  const body = JSON.parse(await req.json());

  if (!validator.isEmail(body.email)) {
    console.error("Invalid email.");
    return NextResponse.json(
      { status: "failed", message: "invalid-email" },
      { status: 400 }
    );
  }
  try {
    // const invitation = await deleteInvitation(user.id, body.email);
    // if (invitation.failed) {
    //   return NextResponse.json({ status: "failed" }, { status: 500 });
    // }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
// export async function GET() {
//   return NextResponse.json({ hello: "world" });
// }
