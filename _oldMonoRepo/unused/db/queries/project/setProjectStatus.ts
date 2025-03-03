import { prisma } from "../..";

import { ProjectStatus } from "../..";

import getUser from "../user/getUser";

import getProjectForOrg from "./getProjectForOrg";

const setProjectStatus = async (
  userId: string,
  projectId: string,
  status: ProjectStatus
) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No organization Id");
    return null;
  }

  const project = await getProjectForOrg(projectId, organizationId);
  if (!project) {
    console.error("No project Id");
    return null;
  }

  return prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      status,
      ...(status === ProjectStatus.completed
        ? {
            closedAt: new Date(Date.now()),
          }
        : {
            closedAt: null,
          }),
    },
  });
};

export default setProjectStatus;
