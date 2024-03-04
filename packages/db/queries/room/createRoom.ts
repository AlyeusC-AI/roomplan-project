import { prisma } from "../../";

import { v4 as uuidv4 } from "uuid";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const createRoom = async (
  userId: string,
  projectPublicId: string,
  name: string
) => {
  const identishotUser = await getUser(userId);
  const organizationId = identishotUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return { failed: true, reason: "no-project" };
  }

  const room = await prisma.room.findFirst({
    where: {
      projectId: project.id,
      name,
      isDeleted: false,
    },
  });

  if (room) return { failed: true, reason: "existing-room" };

  const publicId = uuidv4();

  return await prisma.room.create({
    data: {
      publicId,
      projectId: project.id,
      name,
    },
  });
};

export default createRoom;
