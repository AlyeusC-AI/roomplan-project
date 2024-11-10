import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireEquipment from "../../utils/requireEquipment";
import requireUser from "../../utils/requireUser";

const setName = protectedProcedure
  .input(z.object({ name: z.string().min(1), publicId: z.string().uuid() }))
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const equipment = await requireEquipment(
      user.org?.organizationId as number,
      input.publicId
    );
    return await prisma.equipment.update({
      where: {
        id: equipment.id,
      },
      data: {
        name: input.name,
      },
      select: {
        name: true,
        quantity: true,
        publicId: true,
      },
    });
  });

export default setName;
