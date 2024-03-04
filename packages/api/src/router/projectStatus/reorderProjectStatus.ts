import { prisma } from "@restorationx/db";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const reorderProjectStatuses = protectedProcedure
  .input(
    z.object({
      ordering: z.object({ publicId: z.string() }).array(),
      oldIndex: z.number(),
      newIndex: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    console.log("reodering!", input.ordering);
    const statusesQueries = input.ordering.map((s, i) =>
      (async () => {
        const p = await prisma.projectStatusValue.findFirst({
          where: {
            organizationId: organization.id,
            isDeleted: false,
            publicId: s.publicId,
          },
        });
        if (!p) throw "E";
        await prisma.projectStatusValue.update({
          where: {
            id: p.id,
          },
          data: {
            order: i,
          },
        });
      })()
    );
    await Promise.all(statusesQueries);
    return true;
  });

export default reorderProjectStatuses;
