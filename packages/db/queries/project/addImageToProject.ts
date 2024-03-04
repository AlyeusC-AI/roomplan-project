import { prisma } from "../../";

import { v4 as uuidv4 } from "uuid";

import getUser from "../user/getUser";

import getProjectForOrg from "./getProjectForOrg";

export const addImageToProjectByOrganizationId = async (
  organizationId: number,
  projectPublicId: string,
  key: string
) => {
  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return null;
  }
  const publicId = uuidv4();

  return prisma.image.create({
    data: {
      projectId: project.id,
      key,
      publicId,
      organizationId,
    },
  });
};

const addImageToProject = async (
  userId: string,
  projectPublicId: string,
  key: string
) => {
  const identishotUser = await getUser(userId);
  const organizationId = identishotUser?.org?.organization.id;
  if (!organizationId) return null;
  return addImageToProjectByOrganizationId(
    organizationId,
    projectPublicId,
    key
  );
};

export default addImageToProject;
