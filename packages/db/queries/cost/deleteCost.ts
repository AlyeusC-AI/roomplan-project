import { prisma } from "../../";

import { CostType } from "../../";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const deleteCost = async (
  userId: string,
  projectPublicId: string,
  type: CostType,
  costId: number
) => {
  const identishotUser = await getUser(userId);
  const organizationId = identishotUser?.org?.organization.id;
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
      isDeleted: true,
    },
  });
};

export default deleteCost;
