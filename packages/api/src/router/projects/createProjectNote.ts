import addNoteToProject from "@restorationx/db/queries/project/addNoteToProject";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const createProjectNote = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      body: z.string(),
      mentions: z.array(z.string()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("mentions", input.mentions);
    const user = await requireUser(ctx.user?.id);
    const { projectPublicId, body, mentions } = input;
    // @ts-expect-error - this is a bug in zod
    const { publicId, updatedAt, date } = await addNoteToProject(
      user.id,
      projectPublicId,
      body,
      mentions
    );
    return { publicId, date, updatedAt };
  });

export default createProjectNote;
