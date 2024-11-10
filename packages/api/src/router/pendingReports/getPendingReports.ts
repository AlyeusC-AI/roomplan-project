import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const getPendingReports = protectedProcedure
  .input(
    z.object({
      publicProjectId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    const project = await requireProject(
      input.publicProjectId,
      organization.id
    );
    const pendingRoofReports = await prisma.pendingRoofReports.count({
      where: {
        projectId: project.id,
        isCompleted: false,
      },
    });
    return { pendingRoofReports };
  });

export default getPendingReports;
