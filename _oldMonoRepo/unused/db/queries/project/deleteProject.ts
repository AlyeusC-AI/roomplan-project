import { prisma } from "../..";

import getUser from "../user/getUser";

import getProjectForOrg from "./getProjectForOrg";

const deleteProject = async (userId: string, projectPublicId: string) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };
  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return { failed: true, reason: "no-project" };
  }
  await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      isDeleted: true,
    },
  });

  return { failed: false, reason: null };
};

export default deleteProject;
