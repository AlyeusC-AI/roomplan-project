import { prisma } from "@servicegeek/db";

import { Novu } from "@novu/node";
import assert from "assert";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log(req.body);
  const { reminderId, dynamicId, localizedTimeString } = await req.json();
  console.log("Processing reminder ", reminderId);
  console.log("dynamic id ", dynamicId);

  const calendarEventReminder = await prisma.calendarEventReminder.findFirst({
    where: {
      id: reminderId,
    },
    select: {
      calendarEventId: true,
      calendarEvent: true,
    },
  });

  const calendarEvent = calendarEventReminder?.calendarEvent;

  if (!calendarEvent) {
    return NextResponse.json(
      { status: "ok", result: "No action - Event not found." },
      { status: 200 }
    );
  }

  if (calendarEvent.isDeleted) {
    return NextResponse.json(
      { status: "ok", result: "No action - Event not found." },
      { status: 200 }
    );
  }

  if (!calendarEventReminder) {
    console.error("No action - reminder not found.");

    return NextResponse.json(
      { status: "ok", result: "No action - reminder not found." },
      { status: 200 }
    );
  }

  if (calendarEvent.dynamicId !== dynamicId) {
    console.error("No action - reminder stale.");
    return NextResponse.json(
      { status: "ok", result: "No action - reminder stale." },
      { status: 200 }
    );
  }
  // init nuvo
  const novuApiKey = process.env.NOVU_API_KEY;
  assert(novuApiKey, "NOVU_API_KEY is not defined");
  const novu = new Novu(novuApiKey);

  // const nuvo promises
  const nuvoPromises: Promise<any>[] = [];
  const projectInfo = await prisma.project.findFirst({
    where: {
      id: Number(calendarEvent?.projectId) || 0,
    },
    select: {
      clientPhoneNumber: true,
      clientName: true,
      location: true,
    },
  });

  const messageData = {
    subject: Buffer.from(
      calendarEvent.subject.replaceAll("'", ""),
      "utf-8"
    ).toString(),
    time: localizedTimeString,
    client: projectInfo?.clientName,
    location: projectInfo?.location,
    message: Buffer.from(
      calendarEvent.payload.replaceAll("'", ""),
      "utf-8"
    ).toString(),
  };

  if (calendarEvent.remindClient) {
    console.log(
      "preparing to send to clientPhoneNumber ",
      projectInfo?.clientPhoneNumber
    );
    if (projectInfo?.clientPhoneNumber) {
      nuvoPromises.push(
        novu.trigger("calendar-reminder", {
          to: {
            subscriberId: calendarEvent.publicId,
            phone: `+1${projectInfo?.clientPhoneNumber}`,
          },
          payload: {
            ...messageData,
          },
        })
      );
    }
  }

  if (calendarEvent.remindProjectOwners) {
    const stakeHolders = await prisma.userToProject.findMany({
      where: {
        projectId: calendarEvent?.projectId || 1,
      },
      select: {
        userId: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    const stakeHoldersPhoneNumbers = stakeHolders.map((sholder) =>
      `${sholder.user.phone}`.split("-").join("")
    );

    console.log("preparing to send to stakeholders ", stakeHoldersPhoneNumbers);

    const promises = stakeHoldersPhoneNumbers.map((phoneNumber) => {
      return novu.trigger("calendar-reminder", {
        to: {
          subscriberId: calendarEvent.publicId,
          phone: phoneNumber,
        },
        payload: {
          ...messageData,
        },
      });
    });

    nuvoPromises.push(...promises);
  }

  try {
    if (nuvoPromises.length) {
      console.log(`sending ${nuvoPromises.length} sms triggers`);
      await Promise.all(nuvoPromises);
    } else {
      console.log("no sms triggers to send!");
    }

    return NextResponse.json(
      { status: "ok", result: "notification ran successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error((error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
