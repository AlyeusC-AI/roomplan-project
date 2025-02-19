import { prisma } from "@servicegeek/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const updateInsuranceInfo = mobileProcedure
  .input(
    z.object({
      adjusterName: z.string(),
      adjusterPhoneNumber: z.string().optional(),
      insuranceClaimId: z.string().optional(),
      adjusterEmail: z.string().optional(),
      projectPublicId: z.string().optional(),
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
        ...(input.adjusterName && { adjusterName: input.adjusterName }),
        ...(input.adjusterPhoneNumber && {
          adjusterPhoneNumber: input.adjusterPhoneNumber,
        }),
        ...(input.insuranceClaimId && {
          insuranceClaimId: input.insuranceClaimId,
        }),
        ...(input.adjusterEmail && {
          adjusterEmail: input.adjusterEmail,
        }),
      },
    });

    return { project };
  });

export default updateInsuranceInfo;
