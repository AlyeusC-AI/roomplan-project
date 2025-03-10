import { prisma } from "../..";

import { CostType } from "../..";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const updateCost = async (
  userId: string,
  projectPublicId: string,
  type: CostType,
  costId: number,
  costData: {
    name?: string;
    estimatedCost?: number;
    actualCost?: number;
  }
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

  const cost = await prisma.cost.findFirst({
    where: {
      id: costId,
      projectId: project.id,
      type,
    },
  });

  if (!cost) {
    return null;
  }

  return prisma.cost.update({
    where: {
      id: costId,
    },
    data: {
      ...costData,
    },
  });
};

export default updateCost;
