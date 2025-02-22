import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: NextRequest) {
  const { priceId, type, plan, noTrial } = await request.json();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      payment_method_collection: "if_required",
      submit_type: "subscribe",
      customer_email: user?.email,
      metadata: {
        userId: user!.id,
        organizationId: user?.user_metadata.organizationId,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: noTrial
        ? undefined
        : {
            trial_period_days: 14,
            trial_settings: {
              end_behavior: {
                missing_payment_method: "pause",
              },
            },
          },
      success_url: `${process.env.DOMAIN || "http://localhost:3002"}/projects?session_id={CHECKOUT_SESSION_ID}&from_checkout=true&userId=${user?.id}&organizationId=${user?.user_metadata.organizationId}&plan=${plan}`,
      cancel_url: `${process.env.DOMAIN || "http://localhost:3002"}/${type === "register" ? "register?page=4" : "/settings/billing"}`,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}

declare global {
  type CheckoutSession = Stripe.Response<Stripe.Checkout.Session>;
}
