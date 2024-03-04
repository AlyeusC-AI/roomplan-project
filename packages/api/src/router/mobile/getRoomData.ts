import { prisma } from "@restorationx/db";
import getMembers from "@restorationx/db/queries/organization/getMembers";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const getRoomData = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);
    const roomData = await prisma.project.findFirst({
      where: {
        publicId: input.projectPublicId,
        isDeleted: false,
      },
      select: {
        rooms: {
          where: {
            isDeleted: false,
          },
          include: {
            roomReadings: {
              where: {
                isDeleted: false,
              },
              include: {
                genericRoomReadings: true,
              },
            },
            notes: {
              where: {
                isDeleted: false,
              },
              include: {
                notesAuditTrail: true,
              },
            },
          },
        },
        images: true,
      },
    });

    return { roomData };
  });

export default getRoomData;
