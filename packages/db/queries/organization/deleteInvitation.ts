import { prisma } from "../../";

import getUser from "../user/getUser";

import getIsAdmin from "./getIsAdmin";

const deleteInvitation = async (userId: string, email: string) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAdmin = await getIsAdmin(organizationId, haloUser.id);
  if (!isAdmin) return { false: true, reason: "not-allowed" };

  const existingInvite = await prisma.organizationInvitation.findFirst({
    where: {
      organizationId,
      email,
      isDeleted: false,
      isAccepted: false,
    },
  });
  if (existingInvite) {
    await prisma.organizationInvitation.update({
      where: {
        id: existingInvite.id,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  return true;
};

export default deleteInvitation;
