import createWeatherReportItem from "@restorationx/db/queries/weather-reporting/createWeatherReportItem";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import requireProject from "../../utils/requireProject";
import requireUser from "../../utils/requireUser";

const addWeatherItemToReport = protectedProcedure
  .input(
    z.object({
      projectPublicId: z.string().uuid(),
      date: z.date(),
      time: z.string(),
      f_scale: z.string(),
      speed: z.string(),
      size: z.string(),
      location: z.string(),
      county: z.string(),
      state: z.string(),
      lat: z.string(),
      lon: z.string(),
      comments: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    await requireProject(input.projectPublicId, user.org?.organizationId);
    return createWeatherReportItem(
      user.id,
      input.projectPublicId,
      input.date,
      input.time,
      input.f_scale,
      input.speed,
      input.size,
      input.location,
      input.county,
      input.state,
      input.lat,
      input.lon,
      input.comments
    );
  });

export default addWeatherItemToReport;
