import { prisma } from "../../";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // @ts-expect-error
  apiVersion: "2020-08-27",
});

const createCustomer = async (orgId: number, email: string) => {
  const customerData = {
    metadata: {
      orgId,
    },
    email,
  };
  const customer = await stripe.customers.create(customerData);

  await prisma.customers.create({
    data: {
      customerId: customer.id,
      organizationId: orgId,
    },
  });
  return customer.id;
};

export default createCustomer;
