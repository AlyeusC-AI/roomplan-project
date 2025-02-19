import { prisma } from "../..";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

export type RoomDimensionData = {
  length?: string;
  width?: string;
  height?: string;
  totalSqft?: string;
  windows?: number;
  doors?: number;
  equipmentUsed?: string[];
};

const updateRoomDimensionData = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  roomDimensionData: RoomDimensionData
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

  const filteredData = Object.keys(roomDimensionData)
    .filter((key) => roomDimensionData[key as keyof typeof roomDimensionData])
    .reduce(
      (prev, cur) => ({
        ...prev,
        [cur]: roomDimensionData[cur as keyof typeof roomDimensionData],
      }),
      {}
    ) as RoomDimensionData;

  return prisma.room.update({
    where: {
      id: room.id,
    },
    data: filteredData,
  });
};

export default updateRoomDimensionData;
