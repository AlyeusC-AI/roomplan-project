import { prisma } from "../..";

const getallProjectEquipment = (projectId: number) =>
  prisma.projectEquipment.findMany({
    where: {
      projectId: projectId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      publicId: true,
      quantity: true,
      equipment: {
        select: {
          name: true,
          publicId: true,
          quantity: true,
        },
      },
    },
  });

export default getallProjectEquipment;
