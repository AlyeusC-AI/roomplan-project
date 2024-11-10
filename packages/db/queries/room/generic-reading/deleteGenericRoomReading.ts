import { prisma } from "../../../";
import getProjectForOrg from "../../project/getProjectForOrg";
import getUser from "../../user/getUser";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const deleteGenericRoomReading = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  readingId: string,
  genericRoomReadingId: string
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

  const roomReading = await prisma.roomReading.findFirst({
    where: {
      projectId: project.id,
      roomId: room.id,
      publicId: readingId,
      isDeleted: false,
    },
  });

  if (!roomReading) {
    console.error("No room");
    return null;
  }

  const reading = await prisma.genericRoomReading.findFirst({
    where: {
      isDeleted: false,
      roomReadingId: roomReading.id,
      publicId: genericRoomReadingId,
    },
  });

  if (!reading) {
    console.error("No generic reading");
    return null;
  }

  return prisma.genericRoomReading.update({
    where: {
      id: reading.id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export default deleteGenericRoomReading;
