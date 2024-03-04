import { prisma } from "../../";

import { subDays } from "date-fns";

const getOpenedProjects = async (organizationId: number) => {
  const cur = await prisma.project.count({
    where: {
      organizationId,
      createdAt: {
        gte: subDays(Date.now(), 30),
      },
      isDeleted: false,
    },
  });

  const prev = await prisma.project.count({
    where: {
      organizationId,
      createdAt: {
        gte: subDays(Date.now(), 60),
        lt: subDays(Date.now(), 30),
      },
      isDeleted: false,
    },
  });

  return { cur, prev };
};

const getClosedProjects = async (organizationId: number) => {
  const cur = await prisma.project.count({
    where: {
      organizationId,
      closedAt: {
        gte: subDays(Date.now(), 30),
      },
      isDeleted: false,
    },
  });

  const prev = await prisma.project.count({
    where: {
      organizationId,
      closedAt: {
        gte: subDays(Date.now(), 60),
        lt: subDays(Date.now(), 30),
      },
      isDeleted: false,
    },
  });

  return { cur, prev };
};

const getProjectStats = async (organizationId: number) => {
  const openedProjects = await getOpenedProjects(organizationId);
  const closedProjects = await getClosedProjects(organizationId);

  return { openedProjects, closedProjects };
};

export default getProjectStats;
