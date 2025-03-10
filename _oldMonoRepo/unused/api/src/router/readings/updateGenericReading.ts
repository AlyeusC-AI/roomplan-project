import updateGenericRoomReadingData from "@servicegeek/db/queries/room/generic-reading/updateGenericRoomReadingData";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const updateGenericReading = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      roomPublicId: z.string().uuid(),
      readingPublicId: z.string().uuid(),
      genericReadingPublicId: z.string().uuid(),
      value: z.string().optional(),
      temperature: z.string().optional(),
      humidity: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId
    );
    return updateGenericRoomReadingData(
      project.id,
      input.roomPublicId,
      input.readingPublicId,
      input.genericReadingPublicId,
      input.value,
      input.temperature,
      input.humidity
    );
  });

export default updateGenericReading;
