import { prisma } from "@servicegeek/db";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const getUnreadNotificationCount = protectedProcedure.query(async ({ ctx }) => {
  const user = await requireUser(ctx.user?.id);
  return await prisma.notification.count({
    where: {
      userId: user.id,
      isSeen: false,
    },
  });
});

export default getUnreadNotificationCount;
