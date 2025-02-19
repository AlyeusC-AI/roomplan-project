import { prisma } from "../..";

import templates from "@servicegeek/templates";
import { v4 as uuidv4 } from "uuid";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const setTemplateAsUsed = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  templateCode: string,
  excludedItems?: number[]
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
      publicId: roomId,
      isDeleted: false,
    },
  });

  if (!room) {
    return { failed: true, reason: "no-project" };
  }

  const existingTemplate = await prisma.templatesUsed.findFirst({
    where: {
      roomId: room.id,
      templateCode,
    },
  });

  let excluded = excludedItems || [];

  const template = templates.find((t) => t.id === templateCode);
  if (!template) {
    return { failed: true, reason: "no-template" };
  }

  const inferencePublicId = uuidv4();

  const inference = await prisma.inference.create({
    data: {
      publicId: inferencePublicId,
      projectId: project.id,
      roomId: room.id,
    },
  });
  const newData = [];
  const cleanData = [];

  for (let i = 0; i < template.items.length; i++) {
    if (excluded.indexOf(i) !== -1) continue;
    const item = template.items[i];
    const detectionPublicId = uuidv4();

    newData.push({
      projectId: inference.projectId,
      publicId: detectionPublicId,
      confidence: 1,
      category: item.category,
      code: item.selection,
      quality: "",
      item: item.description,
      inferenceId: inference.id,
      roomId: inference.roomId,
    });
    cleanData.push({
      publicId: detectionPublicId,
      category: item.category,
      code: item.selection,
      item: item.description,
      roomId: inference.roomId,
    });
  }

  const detections = await prisma.detection.createMany({
    data: newData,
    skipDuplicates: true,
  });

  if (existingTemplate)
    return { inferenceId: inferencePublicId, detections: cleanData };

  await prisma.templatesUsed.create({
    data: {
      roomId: room.id,
      templateCode,
    },
  });
  return { inferenceId: inferencePublicId, detections: cleanData };
};

export default setTemplateAsUsed;
