import { prisma } from "@restorationx/db";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";
import { supabaseServiceRole } from "../../utils/supabaseServiceRoleClient";
import getMembers from "@restorationx/db/queries/organization/getMembers";

const PAGE_COUNT = 10;

const getDashboardData = mobileProcedure
  .input(
    z.object({
      searchTerm: z.string().optional(),
      page: z.number(),
      jwt: z.string(),
      userIdFilter: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);

    if (!user.org || !user.org?.organizationId) {
      return {
        count: 0,
        data: [],
        showOrganizationSetup: true,
      };
    }

    const organization = await requireOrganization(user);

    const { searchTerm, page } = input;

    const search = searchTerm
      ? searchTerm
          .split(" ")
          .map((s) => `${s.trim()}:*`)
          .join(" | ")
      : undefined;

    const totalCount = prisma.project.count({
      where: {
        isDeleted: false,
        organizationId: organization.id,
        ...(input.userIdFilter && {
          projectAssignees: {
            every: {
              userId: input.userIdFilter,
            },
          },
        }),
        ...(search && {
          name: {
            search,
          },
          location: {
            search,
          },
          clientEmail: {
            search,
          },
          clientPhoneNumber: {
            search,
          },
          companyName: {
            search,
          },
          assignmentNumber: {
            search,
          },
          managerName: {
            search,
          },
          adjusterEmail: {
            search,
          },
          adjusterName: {
            search,
          },
          adjusterPhoneNumber: {
            search,
          },
          insuranceCompanyName: {
            search,
          },
          insuranceClaimId: {
            search,
          },
          claimSummary: {
            search,
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const results = prisma.project.findMany({
      where: {
        isDeleted: false,
        organizationId: organization.id,
        ...(input.userIdFilter && {
          projectAssignees: {
            some: {
              userId: input.userIdFilter,
            },
          },
        }),
        ...(search && {
          name: {
            search,
          },
          location: {
            search,
          },
          clientEmail: {
            search,
          },
          clientPhoneNumber: {
            search,
          },
          companyName: {
            search,
          },
          assignmentNumber: {
            search,
          },
          managerName: {
            search,
          },
          adjusterEmail: {
            search,
          },
          adjusterName: {
            search,
          },
          adjusterPhoneNumber: {
            search,
          },
          insuranceCompanyName: {
            search,
          },
          insuranceClaimId: {
            search,
          },
          claimSummary: {
            search,
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        publicId: true,
        createdAt: true,
        name: true,
        clientName: true,
        location: true,
        status: true,
        lat: true,
        lng: true,
        currentStatus: {
          select: {
            label: true,
            description: true,
            color: true,
            publicId: true,
          },
        },
        projectAssignees: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: { images: true },
        },
        images: {
          take: 1,
          select: {
            key: true,
          },
          where: {
            isDeleted: false,
          },
        },
      },
    });
    const teamMembersPromise = getMembers(user.org.organization.id);
    const [count, projectData, teamMembers] = await Promise.all([
      totalCount,
      results,
      teamMembersPromise,
    ]);

    const imageKeys = projectData?.reduce<string[]>((prev, cur) => {
      const images = cur.images.reduce<string[]>(
        (p, c) => [decodeURIComponent(c.key), ...p],
        []
      );
      return [...images, ...prev];
    }, []) as string[];

    const { data, error } = await supabaseServiceRole.storage
      .from("project-images")
      .createSignedUrls(imageKeys, 1800);

    const { data: mediaData } = await supabaseServiceRole.storage
      .from("media")
      .createSignedUrls(imageKeys, 1800);
    const arr =
      data && mediaData
        ? [...data, ...mediaData]
        : data
        ? data
        : mediaData
        ? mediaData
        : [];
    const urlMap = arr.reduce<{
      [imageKey: string]: string;
    }>((p, c) => {
      if (c.error) return p;
      if (!c.path) return p;
      return {
        [c.path]: c.signedUrl,
        ...p,
      };
    }, {});
    return {
      count,
      data: projectData,
      showOrganizationSetup: false,
      urlMap,
      teamMembers,
    };
  });

export default getDashboardData;
