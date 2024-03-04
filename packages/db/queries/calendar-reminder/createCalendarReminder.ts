import { prisma } from "../../";

import { ReminderTarget } from "../../";
import { fromUnixTime } from "date-fns";

const createCalendarReminder = async ({
  calendarEventId,
  reminderTarget,
  date,
  dynamicId,
  localizedTimeString,
}: {
  calendarEventId: number;
  reminderTarget: ReminderTarget;
  date: number; // unix time
  dynamicId: string;
  localizedTimeString: string;
}) => {
  const reminder = await prisma.calendarEventReminder.create({
    data: {
      calendarEventId: calendarEventId,
      reminderTarget,
      date: fromUnixTime(date),
    },
  });

  const qstashRes = await fetch(
    `${process.env.QSTASH_PUBLISH_URL}${process.env.IDENTISHOT_CALENDAR_REMINDER_PROCESSING_URL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_AUTHORIZATION_TOKEN}`,
        "Upstash-Not-Before": `${date}`,
      },
      body: JSON.stringify({
        reminderId: reminder.id,
        dynamicId: dynamicId,
        localizedTimeString: localizedTimeString,
      }),
    }
  );
  if (!qstashRes.ok) {
    console.error("Qstash error!", qstashRes);
  } else {
    console.log("qstash ok");
  }
};

export default createCalendarReminder;
