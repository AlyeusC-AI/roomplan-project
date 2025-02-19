import { prisma } from "../..";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

export type ReadingData = {
  gpp?: string;
  dehuReading?: string;
  temperature?: string;
  humidity?: string;
};

const updateRoomReadings = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  readingData: ReadingData
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

  const room = await prisma.room.findFirst({
    where: {
      projectId: project.id,
      publicId: roomId,
      isDeleted: false,
    },
  });

  if (!room) {
    console.error("No room");
    return null;
  }

  const filteredData = Object.keys(readingData)
    .filter((key) => readingData[key as keyof typeof readingData])
    .reduce(
      (prev, cur) => ({
        ...prev,
        [cur]: readingData[cur as keyof typeof readingData],
      }),
      {}
    ) as ReadingData;

  return prisma.room.update({
    where: {
      id: room.id,
    },
    data: filteredData,
  });
};

export default updateRoomReadings;
