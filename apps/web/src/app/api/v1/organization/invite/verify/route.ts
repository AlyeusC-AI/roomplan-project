import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@lib/supabase/admin";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json(
        { valid: false, message: "No token provided" },
        { status: 400 }
      );
    }

    // Get the invitation details
    const { data: invitation, error: inviteError } = await supabaseServiceRole
      .from("OrganizationInvitation")
      .select("*, Organization(name, publicId)")
      .eq("invitationId", token)
      .single();

    if (inviteError || !invitation) {
      console.error("Error fetching invitation:", inviteError);
      return NextResponse.json(
        { valid: false, message: "Invalid invitation" },
        { status: 400 }
      );
    }
    const { data: haloUser } = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("email", invitation.email)
      .single();

    const { data: currentTeamMembers } = await supabaseServiceRole
      .from("UserToOrganization")
      .select("*")
      .eq("organizationId", invitation.organizationId!)
      .eq("isDeleted", false);
    console.log("🚀 ~ GET ~ currentTeamMembers:", currentTeamMembers);
    // Get organization details
    const { data: org } = await supabaseServiceRole
      .from("Organization")
      .select("*")
      .eq("id", invitation.organizationId!)
      .single();
    console.log("🚀 ~ GET ~ org:", org);
    let priceId = "";
    if (
      org?.subscriptionPlan === "startup" ||
      org?.subscriptionPlan === "team"
    ) {
      priceId = process.env.ADDITIONAL_USER_PRICE_ID!;
    } else if (org?.subscriptionPlan === "enterprise") {
      priceId = process.env.ADDITIONAL_USER_PRICE_ID_ENTERPRISE!;
    }

    if (org?.subscriptionPlan === "early_bird") {
      return NextResponse.json(
        {
          valid: false,
          message: "Please upgrade to a paid plan to invite more users",
          subscriptionPlan: org?.subscriptionPlan,
        },
        { status: 400 }
      );
    }

    if ((currentTeamMembers?.length || 0) >= org?.maxUsersForSubscription!) {
      console.log("🚀 ~ GET ~ priceId:", priceId);

      // First, get existing subscription items
      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: org?.subscriptionId!,
      });

      // Find the existing subscription item with our price
      const existingItem = subscriptionItems.data.find(
        (item) => item.price.id === priceId
      );

      if (existingItem) {
        // Update the existing subscription item
        await stripe.subscriptions.update(org?.subscriptionId!, {
          items: [
            {
              id: existingItem.id,
              quantity:
                (existingItem.quantity || 0) +
                (org?.maxUsersForSubscription! -
                  (currentTeamMembers?.length || 0) +
                  1),
            },
          ],
        });
      } else {
        // Create new subscription item if it doesn't exist
        await stripe.subscriptions.update(org?.subscriptionId!, {
          items: [
            {
              price: priceId,
              quantity:
                org?.maxUsersForSubscription! -
                (currentTeamMembers?.length || 0) +
                1,
            },
          ],
        });
      }
    }

    const userOrg = await supabaseServiceRole
      .from("UserToOrganization")
      .insert({
        // userId,
        // organizationId: haloUser?.organizationId!,
        // accessLevel: "member",
        isDeleted: false,
        userId: haloUser?.id!,
        role: "member",
        organizationId: invitation.organizationId!,
        accessLevel: "viewer",
      });

    console.log("🚀 ~ userOrg ~ userOrg:", userOrg);

    // Check if invitation is expired (24 hours)
    // const inviteDate = new Date(invitation.createdAt);
    // const now = new Date();
    // const hoursDiff = (now.getTime() - inviteDate.getTime()) / (1000 * 60 * 60);

    // if (hoursDiff > 24) {
    //   return NextResponse.json(
    //     { valid: false, message: "Invitation expired" },
    //     { status: 400 }
    //   );
    // }

    // Check if invitation was already accepted
    // if (invitation.isAccepted) {
    //   return NextResponse.json(
    //     { valid: false, message: "Invitation already accepted" },
    //     { status: 400 }
    //   );
    // }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      organizationId: invitation.organizationId,
      organizationName: invitation.Organization?.name,
      publicId: invitation.Organization?.publicId,
      inviteId: invitation.id,
    });
  } catch (error) {
    console.error("Error verifying invitation:", error);
    return NextResponse.json(
      { valid: false, message: (error as Error).message || "Server error" },
      { status: 500 }
    );
  }
}
