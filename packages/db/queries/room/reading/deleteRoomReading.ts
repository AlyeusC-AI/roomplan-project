import { prisma } from "../../../";
import getProjectForOrg from "../../project/getProjectForOrg";
import getUser from "../../user/getUser";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const deleteRoomReading = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  readingId: string
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

  const reading = await prisma.roomReading.findFirst({
    where: {
      roomId: room.id,
      isDeleted: false,
      publicId: readingId,
    },
  });

  if (!reading) {
    console.error("No reading");
    return null;
  }

  return prisma.roomReading.update({
    where: {
      id: reading.id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export default deleteRoomReading;
