import { prisma } from "@servicegeek/db";
import { v4 } from "uuid";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const editProjectStatus = protectedProcedure
  .input(
    z.object({
      publicId: z.string(),
      label: z.string(),
      description: z.string(),
      color: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);

    const projectStatus = await prisma.projectStatusValue.findFirst({
      where: {
        organizationId: organization.id,
        publicId: input.publicId,
      },
    });

    if (!projectStatus) {
      throw "Error";
    }

    return await prisma.projectStatusValue.update({
      where: {
        id: projectStatus.id,
      },
      data: {
        label: input.label,
        description: input.description,
        color: input.color,
      },
    });
  });

export default editProjectStatus;
