import { prisma } from "../../";

import { NotificationType } from "../../";
import { v4 as uuidv4 } from "uuid";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const createNotification = async ({
  userId,
  title,
  content,
  notify,
  link,
  projectPublicId,
  excludeCreator = true,
}: {
  userId: string;
  title: string;
  content: string;
  notify: "everyone" | "assignees";
  link?: string;
  projectPublicId?: string;
  excludeCreator?: boolean;
}) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) return null;

  // Create Notifications for every assignee of a project
  if (projectPublicId && notify === "assignees") {
    const project = await getProjectForOrg(projectPublicId, organizationId);
    if (!project) {
      return null;
    }
    const assignes = await prisma.project.findFirst({
      where: {
        id: project.id,
      },
      select: {
        projectAssignees: true,
      },
    });
    if (!assignes) {
      return null;
    }
    let userIds = assignes.projectAssignees.map((assigne) => assigne.userId);
    if (excludeCreator) {
      userIds = userIds.filter((id) => userId !== id);
    }
    return prisma.notification.createMany({
      data: userIds.map((id) => ({
        publicId: uuidv4(),
        type: NotificationType.notification,
        title,
        content,
        link,
        isSeen: false,
        userId: id,
      })),
    });
  }

  // Create Notifications for every assignee of a organization
  if (notify === "everyone") {
    let userIds = servicegeekUser?.org?.organization.users.map(
      (member) => member.user.id
    );
    if (!userIds) return null;
    if (excludeCreator) {
      userIds = userIds.filter((id) => userId !== id);
    }
    console.log("Creating notifications for", userIds);
    return prisma.notification.createMany({
      data: userIds.map((id) => ({
        publicId: uuidv4(),
        type: NotificationType.notification,
        title,
        content,
        link,
        isSeen: false,
        userId: id,
      })),
    });
  }
};

export default createNotification;
