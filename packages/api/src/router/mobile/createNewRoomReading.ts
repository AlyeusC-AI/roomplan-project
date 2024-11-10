import { prisma } from "@servicegeek/db";
import createRoomReading from "@servicegeek/db/queries/room/reading/createRoomReading";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const createNewRoomReading = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
      roomId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);
    return createRoomReading(user.id, input.projectPublicId, input.roomId);
  });

export default createNewRoomReading;
