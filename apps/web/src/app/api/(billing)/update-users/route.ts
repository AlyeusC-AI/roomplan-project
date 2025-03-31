import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { additionalUsers } = await request.json();
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

    // Get organization details
    const { data: org } = await supabase
      .from("Organization")
      .select("*")
      .eq("publicId", user.user_metadata.organizationId)
      .single();

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!org.subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(org.subscriptionId);
    const price = await stripe.prices.retrieve(
      subscription.items.data[0].price.id,
      { expand: ["product"] }
    );

    // Determine plan type
    const plan = price.lookup_key as "startup" | "team" | "enterprise";
    if (!plan || !["startup", "team", "enterprise"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    // Get the additional user price ID
    const additionalUserPriceId =
      plan === "enterprise"
        ? process.env.ADDITIONAL_USER_PRICE_ID_ENTERPRISE
        : process.env.ADDITIONAL_USER_PRICE_ID;

    if (!additionalUserPriceId) {
      return NextResponse.json(
        { error: "Additional user price ID not configured" },
        { status: 500 }
      );
    }

    // Find existing additional user item
    const existingItem = subscription.items.data.find(
      (item) => item.price.id === additionalUserPriceId
    );

    if (existingItem) {
      // Update existing item
      await stripe.subscriptionItems.update(existingItem.id, {
        quantity: additionalUsers,
      });
    } else if (additionalUsers > 0) {
      // Add new item
      await stripe.subscriptions.update(subscription.id, {
        items: [
          {
            price: additionalUserPriceId,
            quantity: additionalUsers,
          },
        ],
      });
    }

    // Calculate total users
    const baseUsers = plan === "startup" ? 2 : plan === "team" ? 5 : 10;
    const totalMaxUsers = baseUsers + additionalUsers;

    // Update organization
    const { error: updateError } = await supabase
      .from("Organization")
      .update({
        maxUsersForSubscription: totalMaxUsers,
      })
      .eq("publicId", user.user_metadata.organizationId);

    if (updateError) {
      return NextResponse.json({ error: updateError }, { status: 400 });
    }

    return NextResponse.json({ success: true, maxUsers: totalMaxUsers });
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json(
      { error: "Error updating users" },
      { status: 500 }
    );
  }
} 