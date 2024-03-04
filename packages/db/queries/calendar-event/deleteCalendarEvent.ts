import { prisma } from "../../";

import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const deleteCalendarEvent = async ({
  userId,
  projectId,
  calendarEventPublicId,
}: {
  userId: string;
  projectId: string;
  calendarEventPublicId: string;
}) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No organization Id");
    return null;
  }
  const project = await getProjectForOrg(projectId, organizationId);
  if (!project) {
    console.error("No project Id");
    return null;
  }
  await prisma.calendarEvent.update({
    where: {
      publicId: calendarEventPublicId,
    },
    data: {
      isDeleted: true,
    },
  });

  return true;
};

export default deleteCalendarEvent;
