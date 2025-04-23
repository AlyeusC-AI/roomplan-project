import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret!);
  } catch (err: any) {
    console.error("Error verifying webhook signature:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object as Stripe.Subscription;

      // Get the price to determine the plan
      const price = await stripe.prices.retrieve(
        subscription.items.data[0].price.id,
        { expand: ["product"] }
      );

      // Use lookup_key to determine plan type
      const plan = price.lookup_key as "startup" | "team" | "enterprise";
      console.log("🚀 ~ POST ~ plan:", plan);

      if (!plan || !["startup", "team", "enterprise"].includes(plan)) {
        return NextResponse.json(
          { error: "Invalid subscription plan" },
          { status: 400 }
        );
      }

      // Calculate total users including additional seats
      let additionalUsers = 0;
      const additionalUserPriceId =
        plan === "enterprise"
          ? process.env.ADDITIONAL_USER_PRICE_ID_ENTERPRISE
          : process.env.ADDITIONAL_USER_PRICE_ID;

      // Find additional user subscription items
      const additionalUserItem = subscription.items.data.find(
        (item) => item.price.id === additionalUserPriceId
      );

      if (additionalUserItem) {
        additionalUsers = additionalUserItem.quantity || 0;
      }

      // Base users per plan
      const baseUsers = plan === "startup" ? 2 : plan === "team" ? 5 : 10;
      const totalMaxUsers = baseUsers + additionalUsers;
      console.log("🚀 ~ POST ~ totalMaxUsers:", totalMaxUsers);

      // Get organization ID from metadata
      const organizationId = subscription.metadata.organizationId;

      // if (!organizationId) {
      //   return NextResponse.json(
      //     { error: "No organization ID in metadata" },
      //     { status: 400 }
      //   );
      // }
      
      // Update organization subscription details
      const { data: org, error } = await supabaseServiceRole
        .from("Organization")
        .update({
          subscriptionId: subscription.id,
          subscriptionPlan: plan,
          customerId: (subscription.customer as string) || undefined,
          maxUsersForSubscription: totalMaxUsers,
          freeTrialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          subscriptionStatus: subscription.status,
        })
        .eq(
          organizationId ? "publicId" : "subscriptionId",
          organizationId || subscription.id
        )
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      return NextResponse.json({ updated: true, organization: org });

    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object as Stripe.Subscription;
      const deletedOrgId = deletedSubscription.metadata.organizationId;

      if (!deletedOrgId) {
        return NextResponse.json(
          { error: "No organization ID in metadata" },
          { status: 400 }
        );
      }

      // Update organization to remove subscription
      const { error: deleteError } = await supabaseServiceRole
        .from("Organization")
        .update({
          subscriptionId: null,
          subscriptionPlan: null,
          maxUsersForSubscription: 0,
          freeTrialEndsAt: null,
        })
        .eq("publicId", deletedOrgId);

      if (deleteError) {
        return NextResponse.json({ error: deleteError }, { status: 400 });
      }

      return NextResponse.json({ updated: true });

    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      const customer = session.customer as Stripe.Customer;
      const newSubscription = session.subscription as Stripe.Subscription;
      console.log(newSubscription);
      console.log(customer);
      if (
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required"
      ) {
        await stripe.subscriptions.update(newSubscription.id, {
          metadata: session.metadata,
        });

        const plan = newSubscription.items.data[0].price.lookup_key as
          | "early_bird"
          | "startup"
          | "team"
          | "enterprise";
        console.log(session.metadata!.organizationId);
        const org = await supabaseServiceRole
          .from("Organization")
          .update({
            subscriptionId:
              typeof newSubscription === "string"
                ? newSubscription
                : newSubscription.id,
            subscriptionPlan: plan,
            stripeSessionId: session.id,
            customerId: typeof customer === "string" ? customer : customer.id,
            maxUsersForSubscription:
              plan === "startup" ? 2 : plan === "team" ? 5 : 10,
            freeTrialEndsAt: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
          })
          .eq("publicId", session.metadata!.organizationId)
          .select("*")
          .single();

        console.log(org);

        return NextResponse.json({ session, org: org.data });
      }

      return NextResponse.json({ updated: true });

    default:
      return NextResponse.json({ received: true });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
