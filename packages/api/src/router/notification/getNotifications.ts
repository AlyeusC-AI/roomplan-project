import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const getNotifications = protectedProcedure
  .input(
    z.object({
      type: z.union([z.literal("notification"), z.literal("activity")]),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    return await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: input.type,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        publicId: true,
        title: true,
        content: true,
        link: true,
        linkText: true,
        type: true,
        isSeen: true,
      },
    });
  });

export default getNotifications;
