import { prisma } from "@servicegeek/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const updateProjectStatusValue = protectedProcedure
  .input(
    z.object({
      label: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      color: z.string().min(1).optional(),
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
    const { publicProjectStatusId, ...rest } = input;
    if (Object.keys(rest).length === 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        // optional: pass the original error to retain stack trace
        cause: "Must provide at least one field",
      });
    }
    return await prisma.projectStatusValue.update({
      where: {
        id: projectStatusValue.id,
      },
      data: {
        ...rest,
      },
    });
  });

export default updateProjectStatusValue;
