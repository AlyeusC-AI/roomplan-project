import { prisma } from "../..";
import getUser from "../user/getUser";
import getProjectForOrg from "./getProjectForOrg";

const updateValue = async (
  userId: string,
  projectPublicId: string,
  valueData: {
    rcvValue?: number;
    actualValue?: number;
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

  return prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      ...valueData,
    },
  });
};

export default updateValue;
