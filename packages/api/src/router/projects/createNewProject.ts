import createProject from "@servicegeek/db/queries/project/createProject";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";

const createNewProject = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      location: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);

    const { publicId, reason } = await createProject(user.id, {
      name: input.name,
      location: input.location,
    });
    return { publicId, reason };
  });

export default createNewProject;
