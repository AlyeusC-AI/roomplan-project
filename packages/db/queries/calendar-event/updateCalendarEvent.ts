import { prisma } from "../../";

import { fromUnixTime } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import createCalendarReminder from "../calendar-reminder/createCalendarReminder";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const updateCalendarEvent = async ({
  userId,
  projectId,
  data,
}: {
  userId: string;
  projectId: string;
  data: {
    calendarEventPublicId: string;
    subject?: string;
    payload?: string;
    date?: number;
    remindProjectOwners?: boolean;
    remindClient?: boolean;
    reminderDate?: number;
    localizedTimeString: string;
  };
}) => {
  const {
    calendarEventPublicId,
    subject,
    payload,
    date,
    remindProjectOwners,
    remindClient,
    reminderDate,
    localizedTimeString,
  } = data;
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
  const dynamicId = uuidv4();

  const existingCalendarEvent = await prisma.calendarEvent.findFirst({
    where: {
      publicId: calendarEventPublicId,
      projectId: project.id,
    },
  });

  if (!existingCalendarEvent) {
    console.error("No calendar event found");
    return null;
  }

  const updatedCalendarInvite = await prisma.calendarEvent.update({
    where: {
      publicId: calendarEventPublicId,
    },
    data: {
      subject: subject || existingCalendarEvent.subject,
      payload: payload || existingCalendarEvent.payload,
      date: date ? fromUnixTime(date) : existingCalendarEvent.date,
      dynamicId,
      remindProjectOwners,
      remindClient,
    },
  });

  if (remindProjectOwners && reminderDate) {
    console.log("Creating reminder for owner.");
    await createCalendarReminder({
      calendarEventId: updatedCalendarInvite.id,
      reminderTarget: "allAssigned",
      date: reminderDate,
      dynamicId,
      localizedTimeString,
    });
  }

  if (remindClient && reminderDate) {
    console.log("Creating reminder for client.");
    await createCalendarReminder({
      calendarEventId: updatedCalendarInvite.id,
      reminderTarget: "client",
      date: reminderDate,
      dynamicId,
      localizedTimeString,
    });
  }

  return updatedCalendarInvite;
};

export default updateCalendarEvent;
