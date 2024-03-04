import { prisma } from "../../";

const getAllOrganizationEquipment = (organizationId: number) =>
  prisma.equipment.findMany({
    where: {
      organizationId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      publicId: true,
      name: true,
      quantity: true,
    },
  });

export default getAllOrganizationEquipment;
