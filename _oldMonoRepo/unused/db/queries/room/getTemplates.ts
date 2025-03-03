import { prisma } from "../..";

import templates from "@servicegeek/templates";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const getTemplates = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  fetchAll: boolean = false
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    return { failed: true, reason: "no-project" };
  }

  let templatesToUse = templates;
  let usedTemplates: { templateCode: string }[] = [];
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
  if (!fetchAll) {
    templatesToUse = templates.filter((template) =>
      template.isApplicable(room.name)
    );
  }
  usedTemplates = await prisma.templatesUsed.findMany({
    where: {
      roomId: room.id,
    },
    select: {
      templateCode: true,
    },
  });

  return templatesToUse
    .sort((a, b) => (a.name > b.name ? 1 : -1))
    .map((t) => ({
      ...t,
      hasBeenApplied: !!usedTemplates.find(
        (template) => template.templateCode === t.id
      ),
    }));
};

export default getTemplates;
