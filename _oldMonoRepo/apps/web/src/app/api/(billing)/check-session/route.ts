import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: NextRequest) {
  const { sessionId, plan } = await request.json();
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log(session);
    const customer = session.customer as Stripe.Customer;
    const subscription = session.subscription as Stripe.Subscription;
    console.log(subscription);
    console.log(customer);
    if (
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required"
    ) {
      console.log(session.metadata!.organizationId);
      const org = await supabaseServiceRole
        .from("Organization")
        .update({
          subscriptionId:
            typeof subscription === "string" ? subscription : subscription.id,
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
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
