import deleteRoomReading from "@restorationx/db/queries/room/reading/deleteRoomReading";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const deleteReading = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      roomPublicId: z.string().uuid(),
      readingPublicId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectPublicId, user.org?.organizationId);
    return deleteRoomReading(
      user.id,
      input.projectPublicId,
      input.roomPublicId,
      input.readingPublicId
    );
  });

export default deleteReading;
