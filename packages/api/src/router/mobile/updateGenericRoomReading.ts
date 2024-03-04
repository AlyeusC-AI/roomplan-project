import { prisma } from "@restorationx/db";
import { calculateGpp } from "@restorationx/db/queries/room/reading/updateRoomReading";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const updateGenericRoomReading = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
      roomId: z.string(),
      readingId: z.string(),
      genericReadingId: z.string(),
      temperature: z.string().optional(),
      relativeHumidity: z.string().optional(),
      value: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireOrganization(user);
    const project = await prisma.project.findFirst({
      where: {
        publicId: input.projectPublicId,
      },
    });
    if (!project) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Missing project",
      });
    }
    const room = await prisma.room.findFirst({
      where: {
        projectId: project.id,
        publicId: input.roomId,
        isDeleted: false,
      },
    });

    if (!room) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Could not find Room",
      });
    }

    const reading = await prisma.roomReading.findFirst({
      where: {
        roomId: room.id,
        isDeleted: false,
        publicId: input.readingId,
      },
    });

    if (!reading) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Could not find Reading",
      });
    }

    const genericReading = await prisma.genericRoomReading.findFirst({
      where: {
        publicId: input.genericReadingId,
        roomReadingId: reading.id,
      },
    });

    if (!genericReading) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Could not find Generic Reading",
      });
    }
    const newReading = await prisma.genericRoomReading.update({
      where: {
        id: genericReading.id,
      },
      data: {
        ...(input.temperature && { temperature: input.temperature }),
        ...(input.relativeHumidity && { humidity: input.relativeHumidity }),
        ...(input.value && {
          value: input.value,
        }),
      },
    });

    return { newReading };
  });

export default updateGenericRoomReading;
