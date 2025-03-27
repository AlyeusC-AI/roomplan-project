import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function GET(request: NextRequest) {
  try {
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

    // Fetch subscription details from Stripe
    const subscription = org.subscriptionId 
      ? await stripe.subscriptions.retrieve(org.subscriptionId, {
          expand: ['items.data.price.product', 'items.data.price.recurring'],
        })
      : null;
    const features = await stripe.products.list({
      ids: [subscription?.items.data[0].price.product.id as string],
    //   expand: ['data.features'],
    });
    console.log("🚀 ~ GET ~ features:", features)
    // Fetch customer details from Stripe
    const customer = org.customerId
      ? await stripe.customers.retrieve(org.customerId)
      : null;

    // Fetch recent invoices
    const invoices = org.customerId
      ? await stripe.invoices.list({
          customer: org.customerId,
          limit: 5,
        })
      : null;

    // Fetch available plans
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

    const availablePlans = prices.data.map((price: Stripe.Price) => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        price: price.unit_amount! / 100,
        product: {
          name: product.name,
          description: product.description,
          marketing_features: product.metadata.marketing_features 
            ? JSON.parse(product.metadata.marketing_features)
            : [],
        },
      };
    });

    // Format the response
    const subscriptionInfo = {
      status: org.subscriptionId ? subscription?.status : "never",
      customerId: org.customerId,
      subscriptionId: org.subscriptionId,
      plan: subscription?.items.data[0] ? {
        name: (subscription.items.data[0].price.product as Stripe.Product).name,
        price: subscription.items.data[0].price.unit_amount! / 100,
        interval: subscription.items.data[0].price.recurring?.interval,
        features: features.data[0].marketing_features.map((feature) => feature.name)
      } : null,
      customer: customer && !customer.deleted ? {
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      } : null,
      currentPeriodEnd: subscription?.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      freeTrialEndsAt: org.freeTrialEndsAt,
      maxUsersForSubscription: org.maxUsersForSubscription,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
      recentInvoices: invoices?.data.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid / 100,
        status: invoice.status,
        date: new Date(invoice.created * 1000).toISOString(),
        pdfUrl: invoice.invoice_pdf,
      })) || [],
      availablePlans,
    };

    return NextResponse.json(subscriptionInfo);
  } catch (error) {
    console.error("Error fetching subscription info:", error);
    return NextResponse.json(
      { error: "Error fetching subscription information" },
      { status: 500 }
    );
  }
} 