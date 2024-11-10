import { prisma } from "@servicegeek/db";
import { v4 } from "uuid";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const createProjectStatus = protectedProcedure
  .input(
    z.object({
      label: z.string(),
      description: z.string(),
      color: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);

    return await prisma.projectStatusValue.create({
      data: {
        label: input.label,
        description: input.description,
        color: input.color,
        organizationId: organization.id,
        publicId: v4(),
      },
      select: {
        label: true,
        description: true,
        color: true,
        publicId: true,
      },
    });
  });

export default createProjectStatus;
