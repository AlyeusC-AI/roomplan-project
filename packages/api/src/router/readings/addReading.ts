import createRoomReading from "@restorationx/db/queries/room/reading/createRoomReading";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const addReading = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      roomPublicId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectPublicId, user.org?.organizationId);
    return createRoomReading(
      user.id,
      input.projectPublicId,
      input.roomPublicId
    );
  });

export default addReading;
