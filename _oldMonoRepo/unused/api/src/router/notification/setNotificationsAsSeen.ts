import { prisma } from "@servicegeek/db";
import { NotificationType } from "@servicegeek/db";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const setNotificationsAsSeen = protectedProcedure.mutation(async ({ ctx }) => {
  const user = await requireUser(ctx.user?.id);
  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      type: NotificationType.notification,
      isSeen: false,
    },
    data: {
      isSeen: true,
    },
  });
});

export default setNotificationsAsSeen;
