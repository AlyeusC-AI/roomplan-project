import { prisma } from "@restorationx/db";
import { GroupByViews } from "@restorationx/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const setGroupView = protectedProcedure
  .input(
    z.object({
      view: z.union([
        z.literal(GroupByViews.roomView),
        z.literal(GroupByViews.dateView),
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
        groupView: input.view,
      },
    });
  });

export default setGroupView;
