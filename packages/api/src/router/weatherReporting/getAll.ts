import getAllWeatherReportItemsByProject from "@restorationx/db/queries/weather-reporting/getAllWeatherReportItemsByProject";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const getAll = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const project = await requireProject(
      input.projectPublicId,
      user.org?.organizationId
    );
    return getAllWeatherReportItemsByProject(project.id);
  });

export default getAll;
