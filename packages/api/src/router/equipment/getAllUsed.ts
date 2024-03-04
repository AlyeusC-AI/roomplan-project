import getallProjectEquipment from "@restorationx/db/queries/equipment/getAllProjectEquipment";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const getAllUsed = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId as number
    );
    return getallProjectEquipment(project.id);
  });

export default getAllUsed;
