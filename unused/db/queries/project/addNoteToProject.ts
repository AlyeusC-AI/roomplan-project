import { prisma } from "../..";

import { v4 as uuidv4 } from "uuid";
import getUser from "../user/getUser";
import getProjectForOrg from "./getProjectForOrg";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const addNoteToProject = async (
  userId: string,
  projectPublicId: string,
  body?: string,
  mentions?: string[]
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

  return prisma.projectNotes.create({
    data: {
      body: body || "",
      userId: userId,
      mentions: mentions || [],
      publicId: uuidv4(),
      projectId: project.id,
    },
    select: {
      publicId: true,
      date: true,
      updatedAt: true,
    },
  });
};

export default addNoteToProject;
