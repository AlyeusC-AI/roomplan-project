import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";
import addNoteToImage from "@restorationx/db/queries/project/addNoteToImage";

const createImageNote = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      body: z.string(),
      imageId: z.number(),
      mentions: z.array(z.string()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    return await addNoteToImage(
      user.id,
      input.projectPublicId,
      input.imageId,
      input.body,
      input.mentions,
    );
  });

export default createImageNote;
