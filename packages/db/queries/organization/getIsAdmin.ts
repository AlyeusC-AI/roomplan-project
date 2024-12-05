import { prisma } from "../../";

import { AccessLevel } from "../../";

const getIsAdmin = async (orgId: number, userId: string) => {
  // Check if user is an admin
  // returns true if user is an admin else false;
  const user = await prisma.userToOrganization.findFirst({
    where: { isDeleted: false, userId: userId, organizationId: orgId },
    select: { isAdmin: true, accessLevel: true },
  });
  if (user?.isAdmin) return true;
  if (user?.accessLevel === AccessLevel.admin) return true;
  return false;
};

export default getIsAdmin;
