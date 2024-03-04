import { prisma } from "../../";

const getInvitation = async (invitationId: string) => {
  return prisma.organizationInvitation.findFirst({
    where: {
      invitationId,
      isDeleted: false,
      isAccepted: false,
    },
  });
};

export default getInvitation;
