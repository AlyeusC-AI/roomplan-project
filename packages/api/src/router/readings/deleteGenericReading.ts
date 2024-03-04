import { default as removeGenericRoomReading } from "@restorationx/db/queries/room/generic-reading/deleteGenericRoomReading";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const deleteGenericReading = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      roomPublicId: z.string().uuid(),
      readingPublicId: z.string().uuid(),
      genericReadingPublicId: z.string().uuid(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectPublicId, user.org?.organizationId);
    return removeGenericRoomReading(
      user.id,
      input.projectPublicId,
      input.roomPublicId,
      input.readingPublicId,
      input.genericReadingPublicId
    );
  });

export default deleteGenericReading;
