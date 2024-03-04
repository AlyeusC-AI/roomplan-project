import { prisma } from "../../";

const getSubscriptions = async (organizationId: number) => {
  return await prisma.subscriptions.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      created: "desc",
    },
  });
};

export default getSubscriptions;
