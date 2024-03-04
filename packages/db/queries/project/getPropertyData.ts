import { prisma } from "../../";

const getPropertyData = async (projectId: number) => {
  return await prisma.propertyData.findFirst({
    where: {
      projectId,
    },
  });
};

export default getPropertyData;
