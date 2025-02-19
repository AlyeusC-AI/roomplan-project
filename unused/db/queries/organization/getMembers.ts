import { prisma } from "../..";

const getMembers = async (orgId: number) => {
  // orgId is the id of an organization
  return prisma.userToOrganization.findMany({
    where: {
      organizationId: orgId,
      isDeleted: false,
      user: { isDeleted: false, isSupportUser: false },
    },
    select: {
      isAdmin: true,
      createdAt: true,
      accessLevel: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export default getMembers;
