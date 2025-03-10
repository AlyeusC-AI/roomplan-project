import { prisma } from "@servicegeek/db";
import createGenericRoomReading from "@servicegeek/db/queries/room/generic-reading/createGenericRoomReading";
import { z } from "zod";

import { mobileProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const createNewGenericRoomReading = mobileProcedure
  .input(
    z.object({
      projectPublicId: z.string(),
      jwt: z.string(),
      roomId: z.string(),
      readingId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    await requireProject(input.projectPublicId, organization.id);
    return createGenericRoomReading(
      user.id,
      input.projectPublicId,
      input.roomId,
      input.readingId,
      "dehumidifer"
    );
  });

export default createNewGenericRoomReading;
