import { prisma } from "../../";

import { AccessLevel } from "../../";

import getUser from "../user/getUser";

const removeMember = async (userId: string, memberId: string) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAllowed =
    haloUser.org?.isAdmin ||
    haloUser.org?.accessLevel === AccessLevel.admin ||
    haloUser.org?.accessLevel === AccessLevel.accountManager;

  if (!isAllowed) return { failed: true, reason: "not-allowed" };

  await prisma.userToOrganization.update({
    where: {
      userId: memberId,
    },
    data: {
      isDeleted: true,
    },
  });

  return { failed: false };
};

export default removeMember;
