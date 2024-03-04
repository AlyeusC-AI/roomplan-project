import { prisma } from "../../";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const deleteWeatherReportItem = async (
  userId: string,
  projectPublicId: string,
  id: number
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

  return prisma.weatherReportItem.delete({
    where: {
      id,
    },
  });
};

export default deleteWeatherReportItem;
