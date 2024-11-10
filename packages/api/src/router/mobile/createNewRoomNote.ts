import { prisma } from "@servicegeek/db";
import createRoomNote from "@servicegeek/db/queries/room/notes/createRoomNote";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const createNewRoomNote = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
      roomId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);
    const roomNote = await createRoomNote(
      user.id,
      input.projectPublicId,
      input.roomId
    );
    return { roomNote };
  });

export default createNewRoomNote;
