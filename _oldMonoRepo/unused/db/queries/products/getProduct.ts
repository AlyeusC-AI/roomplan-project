import { prisma } from "../..";

const getProduct = async (id: string) => {
  return await prisma.products.findFirst({
    where: {
      id,
    },
  });
};

export default getProduct;
