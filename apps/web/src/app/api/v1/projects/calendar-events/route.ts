import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET(req: NextRequest) {
  const [, authUser] = await user(req);

  const projectId = req.nextUrl.searchParams.get("projectId");

  try {
    let results;

    if (projectId) {
      results = await supabaseServiceRole
        .from("CalendarEvent")
        .select("*")
        .eq("projectId", projectId)
        .eq("isDeleted", false)
        .eq("organizationId", authUser.user_metadata.organizationId);
    } else {
      results = await supabaseServiceRole
        .from("CalendarEvent")
        .select("*")
        .eq("isDeleted", false)
        .eq("organizationId", authUser.user_metadata.organizationId);
    }

    if (!results) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ data: results.data });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      subject,
      description,
      start,
      payload,
      remindClient,
      remindProjectOwners,
      reminderTime,
      projectId,
      end,
      users,
    } = await req.json();
    const [, authUser] = await user(req);

    // Calculate reminder date based on reminderTime
    let reminderDate: Date | null = null;
    if (reminderTime) {
      reminderDate = new Date(start);
      switch (reminderTime) {
        case "24h":
          reminderDate.setHours(reminderDate.getHours() - 24);
          break;
        case "2h":
          reminderDate.setHours(reminderDate.getHours() - 2);
          break;
        case "40m":
          reminderDate.setMinutes(reminderDate.getMinutes() - 40);
          break;
      }
    }

    const results = await supabaseServiceRole
      .from("CalendarEvent")
      .insert({
        subject,
        date: start,
        start: start,
        end: end,
        description,
        dynamicId: v4(),
        payload,
        publicId: v4(),
        remindClient,
        remindProjectOwners,
        projectId,
        organizationId: authUser.user_metadata.organizationId,
        reminderTime: reminderTime || null,
        users,
      })
      .select("*")
      .single();

    if (remindClient && reminderDate && projectId) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: results.data!.id,
        date: reminderDate.toISOString(),
        reminderTarget: "client",

        sendEmail: true,
        sendText: true,
      });
    }

    if (remindProjectOwners && reminderDate) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: results.data!.id,
        date: reminderDate.toISOString(),
        reminderTarget: "projectCreator",

        sendEmail: true,
        sendText: true,
      });
    }

    if (users?.length > 0 && reminderDate) {
      users.forEach(async (userId: string) => {
        await supabaseServiceRole.from("CalendarEventReminder").insert({
          date: reminderDate.toISOString(),
          reminderTarget: "allAssigned",
          sendEmail: true,
          sendText: true,
          calendarEventId: results.data!.id,
          userId,
        });
      });
    }

    if (results.error) {
      console.error("error", results.error);
    }

    if (!results) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", data: results.data });
  } catch (err) {
    console.error("err", err);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      id,
      start,
      reminderTime,
      remindClient,
      remindProjectOwners,
      users,
      ...data
    } = await req.json();
    console.log("🚀 ~ PATCH ~ data:", data);
    const [, authUser] = await user(req);

    // Calculate reminder date based on reminderTime
    let reminderDate: Date | null = null;
    if (reminderTime && start) {
      reminderDate = new Date(start);
      switch (reminderTime) {
        case "24h":
          reminderDate.setHours(reminderDate.getHours() - 24);
          break;
        case "2h":
          reminderDate.setHours(reminderDate.getHours() - 2);
          break;
        case "40m":
          reminderDate.setMinutes(reminderDate.getMinutes() - 40);
          break;
      }
    }

    const results = await supabaseServiceRole
      .from("CalendarEvent")
      .update({
        ...data,
        projectId: data.projectId || null,
        remindClient,
        remindProjectOwners,

        start,
        reminderTime: reminderTime || null,
        users,
      })
      .eq("id", id)
      .eq("organizationId", authUser.user_metadata.organizationId)
      .select("*")
      .single();
    console.log("🚀 ~ PATCH ~ results:", results);
    if (results.error) {
      console.error("error", results.error);
      return NextResponse.json(
        { status: results.error.message },
        { status: 500 }
      );
    }

    // Delete existing reminders
    await supabaseServiceRole
      .from("CalendarEventReminder")
      .delete()
      .eq("calendarEventId", id);

    // Add new reminders if needed
    if (remindClient && reminderDate) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: id,
        date: reminderDate.toISOString(),
        reminderTarget: "client",

        sendEmail: true,
        sendText: true,
      });
    }

    if (remindProjectOwners && reminderDate) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: id,
        date: reminderDate.toISOString(),
        reminderTarget: "projectCreator",

        sendEmail: true,
        sendText: true,
      });
    }

    if (users.length > 0 && reminderDate) {
      users.forEach(async (userId: string) => {
        await supabaseServiceRole.from("CalendarEventReminder").insert({
          date: reminderDate.toISOString(),
          reminderTarget: "allAssigned",
          sendEmail: true,
          sendText: true,
          calendarEventId: id,
          userId,
        });
      });
    }
    if (results.error) {
      console.error("error", results.error);
    }

    if (!results) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", data: results.data });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { publicId } = await req.json();
    const [, authUser] = await user(req);

    const results = await supabaseServiceRole
      .from("CalendarEvent")
      .update({ isDeleted: true })
      .eq("publicId", publicId)
      .eq("organizationId", authUser.user_metadata.organizationId)
      .select("id")
      .single();

    await supabaseServiceRole
      .from("CalendarEventReminder")
      .delete()
      .eq("calendarEventId", results.data?.id || 0);

    if (results.error) {
      console.error("error", results.error);
    }

    if (!results) {
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }

    return NextResponse.json({ status: "success" });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }
}
