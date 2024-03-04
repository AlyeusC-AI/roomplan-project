import { prisma } from "../../";

import { v4 as uuidv4 } from "uuid";

export const getRoom = async (projectId: number, name: string) => {
  const room = await prisma.room.findFirst({
    where: {
      projectId,
      name,
      isDeleted: false,
    },
  });

  return room;
};

export const getRoomById = async (projectId: number, roomId: string) => {
  const room = await prisma.room.findFirst({
    where: {
      projectId,
      publicId: roomId,
      isDeleted: false,
    },
  });

  return room;
};

const getOrCreateRoom = async (projectId: number, name: string) => {
  const room = await getRoom(projectId, name);

  if (room) return { room, didCreateRoom: false };

  const publicId = uuidv4();

  // Handle race condition
  try {
    const newRoom = await prisma.room.create({
      data: {
        publicId,
        projectId,
        name,
      },
    });
    return { room: newRoom, didCreateRoom: true };
  } catch (e) {
    const room = await getRoom(projectId, name);
    return { room, didCreateRoom: false };
  }
};

export default getOrCreateRoom;
