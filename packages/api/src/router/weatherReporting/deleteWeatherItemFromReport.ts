import deleteWeatherReportItem from "@servicegeek/db/queries/weather-reporting/removeWeatherItemFromReport";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const deleteWeatherReportItemFromReport = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      id: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectPublicId, user.org?.organizationId);
    return deleteWeatherReportItem(user.id, input.projectPublicId, input.id);
  });

export default deleteWeatherReportItemFromReport;
