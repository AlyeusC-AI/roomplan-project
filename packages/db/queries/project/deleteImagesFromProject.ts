import { prisma } from "../../";

import getUser from "../user/getUser";

import getProjectForOrg from "./getProjectForOrg";

const deleteImagesFromProject = async (
  userId: string,
  projectPublicId: string,
  imageKeys: string[]
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };
  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return { failed: true, reason: "no-project" };
  }

  const deleteDetections = imageKeys.map((imageKey) =>
    prisma.detection.updateMany({
      where: {
        imageKey,
      },
      data: {
        isDeleted: true,
      },
    })
  );

  const deleteInferences = imageKeys.map((imageKey) =>
    prisma.inference.updateMany({
      where: {
        imageKey,
      },
      data: {
        isDeleted: true,
      },
    })
  );

  const deleteImages = imageKeys.map((imageKey) =>
    prisma.image.updateMany({
      where: {
        key: imageKey,
      },
      data: {
        isDeleted: true,
      },
    })
  );
  await Promise.all([
    prisma.$transaction(deleteDetections),
    prisma.$transaction(deleteInferences),
    prisma.$transaction(deleteImages),
  ]);
  return { failed: false, reason: null };
};

export default deleteImagesFromProject;
