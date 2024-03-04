import { prisma } from "../../";

import Stripe from "stripe";

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    active: product.active,
    name: product.name,
    description: product.description ?? "",
    image: product.images?.[0] ?? undefined,
    metadata: product.metadata,
  };
  await prisma.products.upsert({
    where: {
      id: product.id,
    },
    update: {
      ...productData,
    },
    create: {
      id: product.id,
      ...productData,
    },
  });
};

export default upsertProductRecord;
