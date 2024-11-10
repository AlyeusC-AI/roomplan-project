import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireProjectEquipment from "../../utils/requireProjectEquipment";
import requireUser from "../../utils/requireUser";

const removeUsedItem = protectedProcedure
  .input(
    z.object({
      usedItemPublicId: z.string().uuid(),
      projectPublicId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId as number
    );
    const equipment = await requireProjectEquipment(
      project.id,
      input.usedItemPublicId
    );
    return await prisma.projectEquipment.update({
      where: {
        id: equipment.id,
      },
      data: {
        isDeleted: true,
      },
    });
  });

export default removeUsedItem;
