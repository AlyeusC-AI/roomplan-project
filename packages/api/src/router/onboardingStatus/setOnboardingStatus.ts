import { prisma } from "@servicegeek/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const setOnboardingStatus = protectedProcedure
  .input(
    z.object({
      status: z.object({
        seenPhotoModal: z.boolean().optional(),
        seenInviteInitialUsers: z.boolean().optional(),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const status = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        onboardingStatus: true,
      },
    });
    if (!status) {
      return await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          onboardingStatus: input.status,
        },
      });
    }
    const { onboardingStatus } = status;
    if (!onboardingStatus) {
      return await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          onboardingStatus: input.status,
        },
      });
    }

    return await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        onboardingStatus: {
          ...(onboardingStatus as { [key: string]: boolean }),
          ...input.status,
        },
      },
    });
  });

export default setOnboardingStatus;
