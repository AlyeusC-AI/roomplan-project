import { prisma } from "../../../";

import { v4 as uuidv4 } from "uuid";
import getProjectForOrg from "../../project/getProjectForOrg";
import getUser from "../../user/getUser";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const createRoomReading = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  readingData?: ReadingData
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

  return prisma.roomReading.create({
    data: {
      ...(readingData ? readingData : {}),
      roomId: room.id,
      publicId: uuidv4(),
      projectId: project.id,
    },
    select: {
      publicId: true,
      humidity: true,
      temperature: true,
      date: true,
      room: {
        select: {
          publicId: true,
        },
      },
      genericRoomReadings: {
        select: {
          type: true,
          value: true,
          publicId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};

export default createRoomReading;
