import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-01-27.acacia",
    });

    // Get the customer ID from your database based on the authenticated user
    const customerId = "cus_example123"; // Replace with actual customer ID retrieval logic

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
