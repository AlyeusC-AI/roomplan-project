import { prisma } from "../../";

const getInvitations = async (orgId: number) => {
  // orgId is the id of an organization
  return prisma.organizationInvitation.findMany({
    where: {
      organizationId: orgId,
      isDeleted: false,
      isAccepted: false,
    },
    select: {
      email: true,
    },
  });
};

export default getInvitations;
