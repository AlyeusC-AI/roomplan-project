import { prisma } from "../../..";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const updateGenericRoomReadingData = async (
  projectId: number,
  roomId: string,
  readingId: string,
  genericRoomReadingId: string,
  value?: string,
  temperature?: string,
  humidity?: string
) => {
  if (!value && !temperature && !humidity) {
    return null;
  }
  const room = await prisma.room.findFirst({
    where: {
      projectId: projectId,
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
      projectId: projectId,
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
      ...(value && { value }),
      ...(temperature && { temperature }),
      ...(humidity && { humidity }),
    },
  });
};

export default updateGenericRoomReadingData;
