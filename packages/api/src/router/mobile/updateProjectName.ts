import { prisma } from "@servicegeek/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const updateProjectInformation = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      clientName: z.string().optional(),
      clientPhoneNumber: z.string().optional(),
      clientEmail: z.string().optional(),
      location: z.string().optional(),
      jwt: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireOrganization(user);
    const project = await prisma.project.findFirst({
      where: {
        publicId: input.projectPublicId,
      },
    });
    if (!project) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "An unexpected error occurred, please try again later.",
        cause: "Missing project",
      });
    }
    await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        ...(input.clientName && { clientName: input.clientName }),
        ...(input.clientPhoneNumber && {
          clientPhoneNumber: input.clientPhoneNumber,
        }),
        ...(input.clientEmail && {
          clientEmail: input.clientEmail,
        }),
        ...(input.location && {
          location: input.location,
        }),
      },
    });

    return { project };
  });

export default updateProjectInformation;
