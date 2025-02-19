import { prisma } from "../..";

import getUser from "../user/getUser";

import getProjectForOrg from "./getProjectForOrg";

export interface Stakeholders {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  userId: string;
}

const getUsersForProject = async (
  userId: string,
  projectId: string
): Promise<Stakeholders[]> => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No organization Id");
    return [];
  }

  const project = await getProjectForOrg(projectId, organizationId);
  if (!project) {
    console.error("No project Id");
    return [];
  }

  return prisma.userToProject.findMany({
    where: {
      projectId: project.id,
    },
    select: {
      userId: true,
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  });
};

export default getUsersForProject;
