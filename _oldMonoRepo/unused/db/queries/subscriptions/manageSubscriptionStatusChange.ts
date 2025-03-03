import { prisma } from "../..";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-expect-error
  apiVersion: "2020-08-27",
});

const toDateTime = (secs: number) => {
  var t = new Date("1970-01-01T00:30:00Z"); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  id: number,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const paymentMethod = payment_method[payment_method.type];
  await prisma.customers.update({
    where: {
      id,
    },
    data: {
      billingAddress: { ...address },
      paymentMethod: paymentMethod ? paymentMethod : undefined,
    },
  });
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.

  const customer = await prisma.customers.findUnique({
    where: {
      customerId,
    },
  });

  if (!customer) throw "No Customer Found!";

  const { id: uuid, organizationId } = customer;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });

  // Upsert the latest status of the subscription object.
  const subscriptionData = {
    organizationId,
    metadata: subscription.metadata,
    status: subscription.status,
    pricesId: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    cancelAt: subscription.cancel_at
      ? toDateTime(subscription.cancel_at)
      : null,
    canceledAt: subscription.canceled_at
      ? toDateTime(subscription.canceled_at)
      : null,
    currentPeriodStart: toDateTime(subscription.current_period_start),
    currentPeriodEnd: toDateTime(subscription.current_period_end),
    created: toDateTime(subscription.created),
    endedAt: subscription.ended_at ? toDateTime(subscription.ended_at) : null,
    trialStart: subscription.trial_start
      ? toDateTime(subscription.trial_start)
      : null,
    trialEnd: subscription.trial_end
      ? toDateTime(subscription.trial_end)
      : null,
  };

  await prisma.subscriptions.upsert({
    where: {
      id: subscription.id,
    },
    // @ts-ignore
    update: {
      ...subscriptionData,
    },
    // @ts-ignore
    create: {
      id: subscription.id,
      ...subscriptionData,
    },
  });

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
};

export default manageSubscriptionStatusChange;
