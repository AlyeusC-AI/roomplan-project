import { prisma } from "@restorationx/db";
import { v4 } from "uuid";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireEquipment from "../../utils/requireEquipment";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const setQuantityUsed = protectedProcedure
  .input(
    z.object({
      quantity: z.number().gte(0),
      equipmentPublicId: z.string().uuid(),
      projectPublicId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const equipment = await requireEquipment(
      user.org?.organizationId as number,
      input.equipmentPublicId
    );
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId as number
    );

    return await prisma.projectEquipment.upsert({
      where: {
        equipmentId_projectId: {
          equipmentId: equipment.id,
          projectId: project.id,
        },
      },
      update: {
        quantity: input.quantity,
        isDeleted: false,
      },
      create: {
        publicId: v4(),
        quantity: input.quantity,
        equipmentId: equipment.id,
        projectId: project.id,
        isDeleted: false,
      },
      select: {
        quantity: true,
        publicId: true,
      },
    });
  });

export default setQuantityUsed;
