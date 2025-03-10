import { prisma } from "../..";

const getPrice = async (id: string) => {
  return await prisma.prices.findFirst({
    where: {
      id,
    },
  });
};

export default getPrice;
