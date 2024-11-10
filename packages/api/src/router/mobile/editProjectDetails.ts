import { prisma } from "@servicegeek/db";
import updateNote from "@servicegeek/db/queries/room/notes/updateRoomNote";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const editProjectDetails = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
      clientName: z.string(),
      clientEmail: z.string(),
      clientNumber: z.string(),
      location: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    const project = await requireProject(
      input.projectPublicId,
      organization.id
    );
    if (!project) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Failed to update project",
      });
    }
    const updatedProject = await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        name: input.clientName,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhoneNumber: input.clientNumber,
        location: input.location,
      },
    });
    return updatedProject;
  });

export default editProjectDetails;
