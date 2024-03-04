import { prisma } from "@restorationx/db";
import { z } from "zod";

import { mobileProcedure, protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";
import getProjectNotesForProject from "@restorationx/db/queries/project/getProjectNotesForProject";
const PAGE_COUNT = 10;

const getProjectNotes = protectedProcedure
  .input(
    z.object({
      projectId: z.number(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
 
    const data = await getProjectNotesForProject(input.projectId);
    console.log('getProjectNotes', data)
    return data;
  });

export default getProjectNotes;
