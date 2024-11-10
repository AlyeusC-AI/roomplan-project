import { prisma } from "@servicegeek/db";
import deleteNote from "@servicegeek/db/queries/room/notes/deleteRoomNote";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";
import deleteReading from "@servicegeek/db/queries/room/reading/deleteRoomReading";

const deleteRoomReading = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
      roomId: z.string(),
      readingId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);
    return deleteReading(
      user.id,
      input.projectPublicId,
      input.roomId,
      input.readingId
    );
  });

export default deleteRoomReading;
