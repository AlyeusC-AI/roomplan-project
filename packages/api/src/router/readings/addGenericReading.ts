import { type RoomReadingType } from "@servicegeek/db";
import createGenericRoomReading from "@servicegeek/db/queries/room/generic-reading/createGenericRoomReading";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const addGenericReading = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      roomPublicId: z.string().uuid(),
      readingPublicId: z.string().uuid(),
      type: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectPublicId, user.org?.organizationId);
    return createGenericRoomReading(
      user.id,
      input.projectPublicId,
      input.roomPublicId,
      input.readingPublicId,
      input.type as RoomReadingType
    );
  });

export default addGenericReading;
