import { prisma } from "../../";

const getUser = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      inviteId: true,
      phone: true,
      isDeleted: true,
      hasSeenProductTour: true,
      isSupportUser: true,
      savedDashboardView: true,
      productTourData: true,
      photoView: true,
      groupView: true,
      org: {
        select: {
          id: true,
          role: true,
          accessLevel: true,
          isAdmin: true,
          organizationId: true,
          isDeleted: true,
          organization: {
            select: {
              users: {
                where: {
                  isDeleted: false,
                  user: {
                    isDeleted: false,
                    isSupportUser: false,
                  },
                },
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      id: true,
                      email: true,
                    },
                  },
                },
              },
              createdAt: true,
              isDeleted: true,
              publicId: true,
              name: true,
              id: true,
              address: true,
              logoId: true,
            },
          },
        },
      },
    },
  });
  return user;
};

export default getUser;
