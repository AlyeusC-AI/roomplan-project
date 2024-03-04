import { prisma } from "@restorationx/db";
import getMembers from "@restorationx/db/queries/organization/getMembers";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const getProjectOverviewData = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);

    const getProject = prisma.project.findFirst({
      where: {
        publicId: input.projectPublicId,
        isDeleted: false,
      },
      include: {
        projectAssignees: {
          select: {
            userId: true,
            user: {
              select: {
                firstName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const [project, teamMembers] = await Promise.all([
      getProject,
      getMembers(organization.id),
    ]);

    return { project, teamMembers };
  });

export default getProjectOverviewData;
