import { prisma } from "../..";

const getCustomer = async (organizationId: number) => {
  return await prisma.customers.findFirst({
    where: {
      organizationId,
    },
  });
};

export default getCustomer;
