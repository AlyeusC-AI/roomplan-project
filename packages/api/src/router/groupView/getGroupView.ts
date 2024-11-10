import { prisma } from "@servicegeek/db";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const getGroupView = protectedProcedure.query(async ({ input, ctx }) => {
  const user = await requireUser(ctx.user?.id);

  return await prisma.user.findFirst({
    where: {
      id: user.id,
    },
    select: {
      groupView: true,
    },
  });
});

export default getGroupView;
