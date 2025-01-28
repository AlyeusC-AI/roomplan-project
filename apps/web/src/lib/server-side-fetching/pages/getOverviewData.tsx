import { prisma } from "@servicegeek/db";

import { ORG_ACCESS_LEVEL } from "@lib/serverSidePropsUtils/getUserWithAuthStatus";
import { GetServerSidePropsContext } from "next";
import { createClient } from "@lib/supabase/server";

const getOverViewData = async (
  ctx: GetServerSidePropsContext,
  projectPublicId: string
) => {
  const now = performance.now();
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!authUser) {
    return { user: null, accessToken: null };
  }
  const user = await prisma.user.findFirst({
    where: { id: authUser.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      inviteId: true,
      phone: true,
      isDeleted: true,
      isSupportUser: true,
      hasSeenProductTour: true,
      productTourData: true,
      savedDashboardView: true,
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
              createdAt: true,
              isDeleted: true,
              publicId: true,
              name: true,
              id: true,
              address: true,
              logoId: true,
              Subscriptions: {
                take: 1,
                select: {
                  status: true,
                },
              },
              _count: {
                select: { Image: true },
              },
              projects: {
                orderBy: {
                  createdAt: "desc",
                },
                where: {
                  isDeleted: false,
                  publicId: projectPublicId,
                },
                include: {
                  propertyData: true,
                  projectAssignees: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
              users: {
                where: {
                  user: {
                    isSupportUser: false,
                  },
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
              },
            },
          },
        },
      },
    },
  });
  if (!user) {
    return {
      user: null,
      orgAccessLevel: null,
      accessToken: null,
      emailConfirmed: false,
    };
  }

  if (!user.org?.organization.id) {
    return {
      user: user,
      orgAccessLevel: null,
      accessToken: session?.access_token,
      emailConfirmed: authUser.email_confirmed_at,
    };
  }

  if (!user.org) {
    return {
      user: user,
      orgAccessLevel: null,
      accessToken: session?.access_token,
      emailConfirmed: authUser.email_confirmed_at,
    };
  }

  let orgAccessLevel = ORG_ACCESS_LEVEL.MEMBER;
  if (user.org.isDeleted) {
    orgAccessLevel = ORG_ACCESS_LEVEL.REMOVED;
  } else if (user.org.isAdmin) {
    orgAccessLevel = ORG_ACCESS_LEVEL.ADMIN;
  }
  if (user.isSupportUser) {
    orgAccessLevel = ORG_ACCESS_LEVEL.ADMIN;
  }
  const end = performance.now();
  console.log(`getProjectsData took ${end - now} ms`);
  return {
    user: user,
    orgAccessLevel: orgAccessLevel,
    accessToken: session?.access_token,
    emailConfirmed: authUser.email_confirmed_at,
  };
};

export default getOverViewData;
