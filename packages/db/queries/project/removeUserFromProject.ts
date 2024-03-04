import { prisma } from "../../";

import getUser from "../user/getUser";

import getProjectForOrg from "./getProjectForOrg";

const removeUserFromToProject = async (
  userId: string,
  projectId: string,
  user: string
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

  const existingUser = await prisma.userToProject.findFirst({
    where: {
      userId: user,
      projectId: project.id,
    },
  });

  if (existingUser) {
    await prisma.userToProject.delete({
      where: {
        id: existingUser.id,
      },
    });
    return true;
  }
  return false;
};

export default removeUserFromToProject;
