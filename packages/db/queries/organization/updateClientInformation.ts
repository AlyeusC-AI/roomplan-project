// import { prisma } from "../../";

import { AccessLevel, prisma } from "../../";
import getProjectForOrg, { getLatLng } from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const updateClientInformation = async (
  userId: string,
  projectPublicId: string,
  clientName: string,
  clientPhoneNumber: string,
  clientEmail: string,
  location: string,
  claimSummary: string,
  assignmentNumber: string
) => {
  const identishotUser = await getUser(userId);
  const organizationId = identishotUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return { failed: true, reason: "no-project" };
  }

  const latLng = await getLatLng(location);

  await prisma.project.update({
    where: {
      id: project.id,
    },
    data: {
      clientName,
      clientEmail,
      clientPhoneNumber,
      location,
      claimSummary,
      assignmentNumber,
      ...(latLng ? { lat: `${latLng.lat}`, lng: `${latLng.lng}` } : {}),
      lastTimeWeatherFetched: undefined,
    },
  });
  return { failed: false, reason: null };
};

export default updateClientInformation;
