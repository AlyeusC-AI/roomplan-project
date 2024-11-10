import updateRoomReading from "@servicegeek/db/queries/room/reading/updateRoomReading";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const getAll = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      roomPublicId: z.string().uuid(),
      readingPublicId: z.string().uuid(),
      humidity: z.string().optional(),
      temperature: z.string().optional(),
      moistureContentWall: z.string().optional(),
      moistureContentFloor: z.string().optional(),
      date: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectPublicId, user.org?.organizationId);
    return updateRoomReading(
      user.id,
      input.projectPublicId,
      input.roomPublicId,
      input.readingPublicId,
      {
        temperature: input.temperature,
        humidity: input.humidity,
        moistureContentWall: input.moistureContentWall,
        moistureContentFloor: input.moistureContentFloor,
        date: input.date,
      }
    );
  });

export default getAll;
