import { AccessLevel, prisma } from "../../";

import getUser from "../user/getUser";

import getIsAdmin from "./getIsAdmin";

const updateAccessLevel = async (
  userId: string,
  memberId: string,
  accessLevel: AccessLevel
) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAdmin = await getIsAdmin(organizationId, haloUser.id);
  if (!isAdmin) return false;

  const member = await prisma.userToOrganization.findFirst({
    where: {
      userId: memberId,
      organizationId,
    },
  });

  if (!member) return false;

  await prisma.userToOrganization.update({
    where: {
      userId: memberId,
    },
    data: {
      accessLevel,
    },
  });

  return true;
};

export default updateAccessLevel;
