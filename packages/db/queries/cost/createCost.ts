import { prisma } from "../../";

import { CostType } from "../../";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const createCost = async (
  userId: string,
  projectPublicId: string,
  type: CostType
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No org");
    return null;
  }

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    console.error("No project");
    return null;
  }

  return prisma.cost.create({
    data: {
      projectId: project.id,
      type,
    },
  });
  return null;
};

export default createCost;
