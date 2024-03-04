import { prisma } from "@restorationx/db";
import { v4 } from "uuid";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const create = protectedProcedure
  .input(z.object({ name: z.string().min(1) }))
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    return prisma.equipment.create({
      data: {
        organizationId: user.org?.organizationId as number,
        name: input?.name,
        quantity: 1,
        publicId: v4(),
      },
      select: {
        name: true,
        quantity: true,
        publicId: true,
      },
    });
  });

export default create;
