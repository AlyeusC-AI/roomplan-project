import getProjectForOrg from "../../project/getProjectForOrg";
import getUser from "../../user/getUser";
import getAllRoomReadings from "./getAllRoomReadings";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const getRoomReadings = async (userId: string, projectPublicId: string) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No org");
    return [];
  }

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    console.error("No project");
    return [];
  }

  return getAllRoomReadings(project.id);
};

export default getRoomReadings;
