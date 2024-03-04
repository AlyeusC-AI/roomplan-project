import { prisma } from "../../";

const getOrgWithAccessLevel = async (orgId: number, userId: string) => {
  // Check if user is an admin
  // returns true if user is an admin else false;
  return await prisma.userToOrganization.findFirst({
    where: { userId: userId, organizationId: orgId },
    select: { isAdmin: true, isDeleted: true },
  });
};

export default getOrgWithAccessLevel;
