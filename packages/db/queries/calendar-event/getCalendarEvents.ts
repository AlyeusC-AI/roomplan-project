import { prisma } from "../../";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const getCalendarEvents = async ({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No organization Id");
    return null;
  }
  const project = await getProjectForOrg(projectId, organizationId);
  if (!project) {
    console.error("No project");
    return null;
  }

  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      projectId: project.id,
      isDeleted: false,
    },
    select: {
      publicId: true,
      subject: true,
      payload: true,
      project: true,
      projectId: true,
      date: true,
      dynamicId: true,
      isDeleted: true,
    },
  });
  return calendarEvents;
};

export const getAllCalendarEvents = async ({
  userId,
}: {
  userId: string;
}) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No organization Id");
    return null;
  }

  const calendarEvents = await prisma.calendarEvent.findMany({
    where: {
      
      isDeleted: false,
    },
    select: {
      publicId: true,
      subject: true,
      payload: true,
      project: true,
      projectId: true,
      date: true,
      dynamicId: true,
      isDeleted: true,
    },
  });
  return calendarEvents;
};

export default getCalendarEvents;
