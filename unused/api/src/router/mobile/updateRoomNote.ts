import { prisma } from "@servicegeek/db";
import updateNote from "@servicegeek/db/queries/room/notes/updateRoomNote";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const updateRoomNote = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
      roomId: z.string(),
      noteId: z.string(),
      body: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);
    const roomNote = await updateNote(
      user.id,
      input.projectPublicId,
      input.roomId,
      input.noteId,
      input.body
    );
    return { roomNote };
  });

export default updateRoomNote;
