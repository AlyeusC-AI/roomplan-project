import { prisma } from "@servicegeek/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const deleteProjectStatus = protectedProcedure
  .input(
    z.object({
      publicProjectStatusId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);

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
    return await prisma.projectStatusValue.update({
      where: {
        id: projectStatusValue.id,
      },
      data: {
        isDeleted: true,
      },
      select: {
        label: true,
        description: true,
        color: true,
        publicId: true,
      },
    });
  });

export default deleteProjectStatus;
