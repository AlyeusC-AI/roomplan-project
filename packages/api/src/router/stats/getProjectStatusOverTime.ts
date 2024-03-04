import getClosedChartData from "@restorationx/db/queries/project/stats/getClosedChartData";
import getOpenedChartData from "@restorationx/db/queries/project/stats/getOpenedChartData";

import { protectedProcedure } from "../../trpc";
import requireOrganization from "../../utils/requireOrganization";
import requireUser from "../../utils/requireUser";

const getProjectStatusOverTime = protectedProcedure.query(
  async ({ input, ctx }) => {
    const user = await requireUser(ctx.user?.id);
    const { id } = requireOrganization(user);
    const closed = await getClosedChartData(id);
    const opened = await getOpenedChartData(id);
    return { closed, opened };
  }
);

export default getProjectStatusOverTime;
