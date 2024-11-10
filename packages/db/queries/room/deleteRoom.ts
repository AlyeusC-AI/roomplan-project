import { prisma } from "../../";

import { PrismaPromise } from "../../";
import { v4 as uuidv4 } from "uuid";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const deleteRoom = async (
  userId: string,
  projectPublicId: string,
  roomPublicId: string
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return { failed: true, reason: "no-project" };
  }
  const room = await prisma.room.findFirst({
    where: {
      projectId: project.id,
      publicId: roomPublicId,
    },
  });

  if (!room) return { failed: true, reason: "no-room" };

  const imageKeys = await prisma.inference.findMany({
    where: {
      projectId: project.id,
    },
    select: {
      imageKey: true,
    },
  });

  let deleteImages: PrismaPromise<any>[] = [];
  if (imageKeys) {
    deleteImages = imageKeys.map(({ imageKey }) =>
      prisma.image.updateMany({
        where: {
          key: imageKey || "",
        },
        data: {
          isDeleted: true,
        },
      })
    );
  }

  const deleteDetections = prisma.detection.updateMany({
    where: {
      roomId: room.id,
    },
    data: {
      isDeleted: true,
    },
  });

  const deleteInferences = prisma.inference.updateMany({
    where: {
      roomId: room.id,
    },
    data: {
      isDeleted: true,
    },
  });

  await Promise.all([
    prisma.$transaction([deleteDetections]),
    prisma.$transaction([deleteInferences]),
    prisma.$transaction(deleteImages),
  ]);

  return await prisma.room.update({
    where: {
      id: room.id,
    },
    data: {
      isDeleted: true,
      name: `${uuidv4()}-${room.name}`,
    },
  });
};

export default deleteRoom;
