import { z } from "zod";
import { prisma } from "@restorationx/db";

import { mobileProcedure } from "../../trpc";
import requireUser from "../../utils/requireUser";
import createProject from "@restorationx/db/queries/project/createProject";
import requireOrganization from "../../utils/requireOrganization";
import { TRPCError } from "@trpc/server";
import requireProject from "../../utils/requireProject";

const addProjectAssignee = mobileProcedure
  .input(
    z.object({
      jwt: z.string(),
      userId: z.string(),
      projectPublicId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    const project = await requireProject(
      input.projectPublicId,
      organization.id
    );
    try {
      const projectAssignee = await prisma.userToProject.create({
        data: {
          userId: input.userId,
          projectId: project.id,
        },
        select: {
          userId: true,
          user: {
            select: {
              firstName: true,
              email: true,
            },
          },
        },
      });
      return { projectAssignee };
    } catch (e) {
      console.log(e);
    }
    return { projectAssignee: null };
  });

export default addProjectAssignee;
