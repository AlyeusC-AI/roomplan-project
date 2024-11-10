import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const getRooms = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId
    );
    return prisma.room.findMany({
      where: {
        projectId: project.id,
        isDeleted: false,
      },
      select: {
        publicId: true,
        name: true,
      },
    });
  });

export default getRooms;
