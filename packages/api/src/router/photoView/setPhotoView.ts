import { prisma } from "@servicegeek/db";
import { PhotoViews } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const setPhotoView = protectedProcedure
  .input(
    z.object({
      view: z.union([
        z.literal(PhotoViews.photoGridView),
        z.literal(PhotoViews.photoListView),
      ]),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);

    return await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        photoView: input.view,
      },
    });
  });

export default setPhotoView;
