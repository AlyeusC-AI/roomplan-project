import { prisma } from "@restorationx/db";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const getPhotoView = protectedProcedure.query(async ({ input, ctx }) => {
  const user = await requireUser(ctx.user?.id);

  return await prisma.user.findFirst({
    where: {
      id: user.id,
    },
    select: {
      photoView: true,
    },
  });
});

export default getPhotoView;
