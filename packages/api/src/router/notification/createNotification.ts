import { default as createNotificationHelper } from "@restorationx/db/queries/notification/createNotification";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const createNotification = protectedProcedure
  .input(
    z.object({
      type: z.union([z.literal("notification"), z.literal("activity")]),
      title: z.string(),
      content: z.string(),
      notify: z.union([z.literal("everyone"), z.literal("assignees")]),
      link: z.string().optional(),
      projectPublicId: z.string().optional(),
      excludeCreator: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const organization = await requireOrganization(user);
    if (input.projectPublicId) {
      const project = await requireProject(
        input.projectPublicId,
        organization.id
      );
      await createNotificationHelper({
        userId: user.id,
        title: input.title,
        content: input.content,
        link: input.link,
        excludeCreator: input.excludeCreator,
        projectPublicId: project.publicId,
        notify: input.notify,
      });
    } else {
      await createNotificationHelper({
        userId: user.id,
        title: input.title,
        content: input.content,
        link: input.link,
        excludeCreator: input.excludeCreator,
        notify: input.notify,
      });
    }
  });

export default createNotification;
