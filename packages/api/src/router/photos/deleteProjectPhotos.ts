import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const deleteProjectPhotos = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      photoIds: z.array(z.string().uuid()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);
    return await prisma.image.updateMany({
      where: {
        publicId: {
          in: input.photoIds,
        },
      },
      data: {
        isDeleted: true,
      },
    });
  });

export default deleteProjectPhotos;
