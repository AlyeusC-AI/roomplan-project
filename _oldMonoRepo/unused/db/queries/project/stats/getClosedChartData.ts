import { addDays, subDays } from "date-fns";
import { prisma } from "../../..";

const getClosedChartData = async (organizationId: number) => {
  const windowInDays = 7;
  const intervals = 10;
  const queries = [];
  for (let i = 0; i < intervals; i++) {
    const currentWindowStart = windowInDays * i + 1;
    const startWindow = subDays(Date.now(), currentWindowStart);
    queries.push(
      prisma.project.count({
        where: {
          organizationId,
          closedAt: {
            gte: startWindow,
            lte: addDays(startWindow, windowInDays),
          },
          isDeleted: false,
        },
      })
    );
  }

  const closedProjectsArr = await prisma.$transaction(queries);
  return closedProjectsArr.map((count, index) => {
    const currentWindowStart = windowInDays * index + 1;
    const startWindow = subDays(Date.now(), currentWindowStart);
    return {
      value: count,
      dateStart: startWindow,
      dateEnd: addDays(startWindow, windowInDays),
    };
  });
};

export default getClosedChartData;
