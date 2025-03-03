import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-01-27.acacia",
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    let customerId = null;
    // Get organization details for the user
    const { data: org } = await supabase
      .from("Organization")
      .select("customerId")
      .eq("publicId", user.user_metadata.organizationId)
      .single();

    if (!org?.customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
      });
      customerId = stripeCustomer.id;
      await supabase
        .from("Organization")
        .update({ customerId: customerId })
        .eq("publicId", user.user_metadata.organizationId);
    } else {
      customerId = org.customerId;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No customer ID found" },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get("origin")}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating portal session" },
      { status: 500 }
    );
  }
}
