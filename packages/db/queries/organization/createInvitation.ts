import { prisma } from "../../";

import { v4 as uuidv4 } from "uuid";

import getUser from "../user/getUser";

import getIsAdmin from "./getIsAdmin";

const createInvitation = async (userId: string, email: string) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAdmin = await getIsAdmin(organizationId, haloUser.id);
  if (!isAdmin) return { false: true, reason: "not-allowed" };

  const existingMember = await prisma.userToOrganization.findFirst({
    where: {
      organizationId,
      isDeleted: false,
      user: { isDeleted: false, email },
    },
    select: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (existingMember) return { failed: true, reason: "existing-member" };

  const invitationId = uuidv4();
  const existingInvite = await prisma.organizationInvitation.findFirst({
    where: {
      organizationId,
      email,
      isDeleted: false,
      isAccepted: false,
    },
  });
  
  if (existingInvite) return { failed: true, reason: "existing-invite" };

  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      invitations: {
        create: [
          {
            email,
            invitationId,
          },
        ],
      },
    },
  });
  return {
    failed: false,
    reason: null,
    inviteId: invitationId,
    orgId: organizationId,
  };
};

export default createInvitation;
