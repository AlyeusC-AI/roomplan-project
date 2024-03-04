import { prisma } from "@restorationx/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const getAllProjectStatuses = protectedProcedure
  .input(
    z.object({
      publicProjectId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);

    const statusesQuery = prisma.projectStatusValue.findMany({
      where: {
        organizationId: organization.id,
        isDeleted: false,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        label: true,
        description: true,
        color: true,
        publicId: true,
        order: true,
      },
    });
    if (input.publicProjectId) {
      const selectedStatusQuery = prisma.project.findFirst({
        where: {
          publicId: input.publicProjectId,
        },
        select: {
          currentStatus: {
            select: {
              label: true,
              description: true,
              color: true,
              publicId: true,
            },
          },
        },
      });

      const [statuses, selectedStatus] = await Promise.all([
        statusesQuery,
        selectedStatusQuery,
      ]);

      // const sortedStatuses = statuses.sort((a, b) => (a < b ? 0 : -1));
      // console.log(sortedStatuses);
      return {
        statuses,
        selectedStatus,
      };
    } else {
      const [statuses] = await Promise.all([statusesQuery]);
      return {
        statuses,
      };
    }
  });

export default getAllProjectStatuses;
