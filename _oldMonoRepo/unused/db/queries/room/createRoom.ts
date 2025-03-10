import { prisma } from "../..";

import { v4 as uuidv4 } from "uuid";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const createRoom = async (
  userId: string,
  projectPublicId: string,
  name: string
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) throw Error("organization-not-found");

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    throw Error("project-not-found");
  }

  const room = await prisma.room.findFirst({
    where: {
      projectId: project.id,
      name,
      isDeleted: false,
    },
  });

  if (room) throw Error("existing-room");

  const publicId = uuidv4();

  return await prisma.room.create({
    data: {
      publicId,
      projectId: project.id,
      name,
    },
    select: {
      publicId: true,
    },
  });
};

export default createRoom;
