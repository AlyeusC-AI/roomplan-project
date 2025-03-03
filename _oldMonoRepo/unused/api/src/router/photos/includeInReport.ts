import { prisma } from "@servicegeek/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const setIncludeInReport = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      imagePublicId: z.string().uuid(),
      includeInReport: z.boolean(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId as number
    );
    const organization = await requireOrganization(user);
    const image = await prisma.image.findFirst({
      where: {
        publicId: input.imagePublicId,
        projectId: project.id,
        organizationId: organization.id,
      },
    });
    if (!image) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        // optional: pass the original error to retain stack trace
        cause: "No image",
      });
    }
    return await prisma.image.update({
      where: {
        id: image.id,
      },
      data: {
        includeInReport: input.includeInReport,
      },
    });
  });

export default setIncludeInReport;
