import { prisma } from "../..";

import getUser from "../user/getUser";

const updateRoomForInference = async (
  imageKey: string,
  roomId: string,
  userId: string
) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const image = await prisma.image.findFirst({
    where: {
      key: imageKey,
    },
  });

  const projectForImage = await prisma.project.findFirst({
    where: {
      id: image?.projectId,
    },
  });

  const room = await prisma.room.findFirst({
    where: {
      publicId: roomId,
    },
  });

  const existingInference = await prisma.inference.findFirst({
    where: {
      imageKey,
    },
  });

  if (!existingInference || !room) {
    return { failed: true, reason: "no-room-or-inference" };
  }

  if (organizationId !== projectForImage?.organizationId) {
    return { failed: true, reason: "not-part-of-org" };
  }

  const updateInference = prisma.inference.update({
    where: {
      imageKey,
    },
    data: {
      roomId: room.id,
    },
  });

  const updateDetections = prisma.detection.updateMany({
    where: {
      roomId: existingInference.roomId,
    },
    data: {
      roomId: room.id,
    },
  });

  await prisma.$transaction([updateDetections, updateInference]);
};

export default updateRoomForInference;
