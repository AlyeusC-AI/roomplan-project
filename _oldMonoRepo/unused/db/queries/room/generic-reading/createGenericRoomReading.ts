import { prisma } from "../../..";

import { RoomReadingType } from "../../..";
import { v4 as uuidv4 } from "uuid";
import getUser from "../../user/getUser";
import getProjectForOrg from "../../project/getProjectForOrg";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const createGenericRoomReading = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  readingId: string,
  type: string
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

  return prisma.genericRoomReading.create({
    data: {
      roomReadingId: roomReading.id,
      value: "",
      publicId: uuidv4(),
      // @ts-ignore
      type,
    },
    select: {
      type: true,
      value: true,
      publicId: true,
    },
  });
};

export default createGenericRoomReading;
