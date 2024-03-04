import { prisma } from "../../";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const updateProjectInformation = async (
  userId: string,
  projectPublicId: string,
  name: string,
  managerName: string,
  companyName: string,
  roofSegments: string[],
  roofSpecs: {
    roofPitch: string;
  }
) => {
  const identishotUser = await getUser(userId);
  const organizationId = identishotUser?.org?.organization.id;
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
      name,
      managerName,
      companyName,
      roofSegments,
      roofSpecs,
    },
  });
  return { failed: false, reason: null };
};

export default updateProjectInformation;
