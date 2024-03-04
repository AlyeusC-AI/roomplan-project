import { prisma } from "../../";

import getInvitation from "./getInvitation";

const acceptInvitation = async (invitationId: string) => {
  const invitation = await getInvitation(invitationId);
  console.log("Found invitation");
  if (!invitation) return;

  await prisma.organizationInvitation.update({
    where: {
      invitationId,
    },
    data: {
      isAccepted: true,
    },
  });
};

export default acceptInvitation;
