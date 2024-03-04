import { prisma } from "@restorationx/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const associateProjectStatus = protectedProcedure
  .input(
    z.object({
      publicProjectStatusId: z.string(),
      publicProjectId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    const project = await requireProject(
      input.publicProjectId,
      organization.id
    );

    const projectStatusValue = await prisma.projectStatusValue.findFirst({
      where: {
        publicId: input.publicProjectStatusId,
        organizationId: organization.id,
      },
    });
    if (!projectStatusValue) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        // optional: pass the original error to retain stack trace
        cause: "No project status",
      });
    }
    return await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        projectStatusValueId: projectStatusValue.id,
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
  });

export default associateProjectStatus;
