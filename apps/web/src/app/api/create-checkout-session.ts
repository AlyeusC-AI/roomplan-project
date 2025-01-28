import { getStripePriceFromClientID } from "unused/stripe/getStripePriceFromClientID";
import createCustomer from "@servicegeek/db/queries/customers/createCustomer";
import getCustomer from "@servicegeek/db/queries/customers/getCustomer";
import getUser from "@servicegeek/db/queries/user/getUser";
import Stripe from "stripe";
import { createClient } from "@lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();
    const stripePriceId = getStripePriceFromClientID(priceId);
    const supabaseClient = await createClient();

    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (!user || error || !stripePriceId) {
      return NextResponse.json(
        { message: "Could not create checkout session" },
        { status: 500 }
      );
    }

    const servicegeekUser = await getUser(user.id);
    if (!servicegeekUser) {
      return redirect("/register");
    }
    if (!servicegeekUser.org?.organizationId) {
      return redirect("/projects");
    }
    const teamMembers = servicegeekUser.org.organization.users;
    const customer = await getCustomer(servicegeekUser.org.organizationId);
    let customerId = customer ? customer.customerId : null;
    if (!customerId) {
      customerId = await createCustomer(
        servicegeekUser.org.organizationId,
        servicegeekUser.email
      );
    }

    // Create Checkout Sessions from body params.
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/projects?alert=checkout_success&session_id={CHECKOUT_SESSION_ID}`,
      customer: customerId,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      client_reference_id: `${servicegeekUser.org.organizationId}`,
      line_items: [
        {
          price: stripePriceId,
          quantity: teamMembers.length,
        },
      ],
      billing_address_collection: "required",
      payment_method_types: ["card", "us_bank_account"],
    };
    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create(params);
    if (checkoutSession.url) {
      return redirect(checkoutSession.url);
    }

    return NextResponse.json(
      { message: "Could not create checkout session" },
      { status: 500 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
