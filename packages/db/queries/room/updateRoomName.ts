import { prisma } from "../../";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const updateRoomName = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
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
      publicId: roomId,
      isDeleted: false,
    },
  });

  if (!room) return { failed: true, reason: "no-room" };

  return await prisma.room.update({
    where: {
      id: room.id,
    },
    data: {
      name,
    },
  });
};

export default updateRoomName;
