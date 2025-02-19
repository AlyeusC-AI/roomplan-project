import { prisma } from "../../..";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const getAllRoomReadings = async (projectId: number) => {
  return prisma.roomReading.findMany({
    where: {
      projectId: projectId,
      isDeleted: false,
    },
    select: {
      publicId: true,
      humidity: true,
      temperature: true,
      moistureContentWall: true,
      moistureContentFloor: true,
      equipmentUsed: true,
      date: true,
      gpp: true,
      room: {
        select: {
          publicId: true,
        },
      },
      genericRoomReadings: {
        select: {
          type: true,
          value: true,
          temperature: true,
          humidity: true,
          publicId: true,
        },
        where: {
          isDeleted: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
};

export default getAllRoomReadings;
