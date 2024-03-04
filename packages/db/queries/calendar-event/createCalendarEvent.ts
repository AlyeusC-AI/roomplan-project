import { prisma } from "../../";
import { fromUnixTime } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import createCalendarReminder from "../calendar-reminder/createCalendarReminder";
import getProjectForOrg from "../project/getProjectForOrg";
import getUser from "../user/getUser";

const createCalendarEvent = async ({
  userId,
  projectId,
  data,
}: {
  userId: string;
  projectId: string;
  data: {
    subject: string;
    payload: string;
    date: number;
    remindProjectOwners: boolean;
    remindClient: boolean;
    reminderDate: number;
    localizedTimeString: string;
  };
}) => {
  const {
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
    console.error("No project Id");
    return null;
  }
  const dynamicId = uuidv4();
  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      projectId: project.id,
      subject,
      payload,
      date: fromUnixTime(date),
      publicId: uuidv4(),
      dynamicId,
      remindProjectOwners,
      remindClient,
    },
  });

  if (remindProjectOwners) {
    console.log("Creating reminder for owner.");
    await createCalendarReminder({
      calendarEventId: calendarEvent.id,
      reminderTarget: "allAssigned",
      date: reminderDate,
      dynamicId,
      localizedTimeString,
    });
  }

  if (remindClient) {
    console.log("Creating reminder for client.");
    await createCalendarReminder({
      calendarEventId: calendarEvent.id,
      reminderTarget: "client",
      date: reminderDate,
      dynamicId,
      localizedTimeString,
    });
  }

  return calendarEvent;
};

export default createCalendarEvent;
