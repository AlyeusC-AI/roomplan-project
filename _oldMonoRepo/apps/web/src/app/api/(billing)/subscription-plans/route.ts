import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      expand: ["data.product"],
      active: true,
      type: "recurring",
      recurring: {
        interval: "month",
        usage_type: "licensed",
      },
      lookup_keys: ["enterprise", "team", "startup"],
    });

    const plans = prices.data.map((price) => ({
      id: price.id,
      product: price.product,
      price: price.unit_amount! / 100,
      interval: price.recurring?.interval,
      price_id: price.id,
    }));

    console.log(plans);

    return NextResponse.json(plans);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching subscription plans" },
      { status: 500 }
    );
  }
}

declare global {
  interface SubscriptionPlan {
    id: string;
    product: Stripe.Product;
    price: number;
    interval: Stripe.Price.Recurring.Interval;
    price_id: string;
  }
}
