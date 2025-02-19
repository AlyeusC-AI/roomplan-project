import { prisma } from "../..";

import { AreaAffectedType } from "../..";
import { v4 as uuidv4 } from "uuid";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

export type AffectedAreaData = {
  material?: string;
  totalAreaRemoved?: string;
  totalAreaMicrobialApplied?: string;
  cause?: string;
  category?: number;
  cabinetryRemoved?: string;
  isDeleted?: boolean;
};

const updateOrCreateRoomAffectedArea = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  affectedAreaData: AffectedAreaData,
  type: AreaAffectedType
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

  let affectedArea = await prisma.areaAffected.findFirst({
    where: {
      projectId: project.id,
      roomId: room.id,
      type,
    },
  });

  const filteredData = Object.keys(affectedAreaData)
    .filter((key) => affectedAreaData[key as keyof typeof affectedAreaData])
    .reduce(
      (prev, cur) => ({
        ...prev,
        [cur]: affectedAreaData[cur as keyof typeof affectedAreaData],
      }),
      {}
    ) as AffectedAreaData;

  if (!affectedArea) {
    return prisma.areaAffected.create({
      data: {
        projectId: project.id,
        roomId: room.id,
        type,
        publicId: uuidv4(),
        ...filteredData,
      },
    });
  }
  return prisma.areaAffected.update({
    where: {
      id: affectedArea.id,
    },
    data: {
      ...filteredData,
      ...(affectedAreaData.isDeleted === undefined ? { isDeleted: false } : {}),
    },
  });
};

export default updateOrCreateRoomAffectedArea;
