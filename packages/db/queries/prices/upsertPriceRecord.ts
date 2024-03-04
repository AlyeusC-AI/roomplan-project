import { prisma } from "../../";

import Stripe from "stripe";

const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData = {
    productId: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? "",
    type: price.type,
    unitAmount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    intervalCount: price.recurring?.interval_count,
    trialPeriodDays: price.recurring?.trial_period_days,
    metadata: price.metadata,
  };

  await prisma.prices.upsert({
    where: {
      id: price.id,
    },
    update: {
      ...priceData,
    },
    create: {
      id: price.id,
      ...priceData,
    },
  });
};

export default upsertPriceRecord;
