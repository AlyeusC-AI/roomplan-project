import { prisma } from "@servicegeek/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const setRoomForProjectPhotos = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      photoKeys: z.array(z.string()),
      roomId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    const project = await requireProject(
      input.projectPublicId,
      organization.id
    );
    const room = await prisma.room.findFirst({
      where: {
        publicId: input.roomId,
      },
    });
    if (!room) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        // optional: pass the original error to retain stack trace
        cause: "No room",
      });
    }
    return await prisma.inference.updateMany({
      where: {
        projectId: project.id,
        imageKey: {
          in: input.photoKeys,
        },
      },
      data: {
        roomId: room.id,
      },
    });
  });

export default setRoomForProjectPhotos;
