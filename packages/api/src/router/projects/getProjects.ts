import { prisma } from "@restorationx/db";
import { z } from "zod";

import { mobileProcedure, protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const PAGE_COUNT = 10;

const getAll = protectedProcedure
  .input(
    z.object({
      searchTerm: z.string().optional(),
      page: z.number(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);

    const organization = await requireOrganization(user);
    const { searchTerm, page } = input;
    let skip = 0;
    const take = PAGE_COUNT;

    if (input.page) {
      if (input.page > 1) {
        skip = PAGE_COUNT * (input.page - 1);
      }
    }
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
      take,
      skip,
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

    const [count, data] = await prisma.$transaction([totalCount, results]);
    return { count, data };
  });

export default getAll;
