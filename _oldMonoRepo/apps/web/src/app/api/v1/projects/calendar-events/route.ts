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
      })
      .select("*")
      .single();

    if (remindClient && reminderDate) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: results.data!.id,
        date: reminderDate.toISOString(),
        reminderTarget: "client",
      });
    }

    if (remindProjectOwners && reminderDate) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: results.data!.id,
        date: reminderDate.toISOString(),
        reminderTarget: "projectCreator",
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

export async function PATCH(req: NextRequest) {
  try {
    const {
      id,
      start,
      reminderTime,
      remindClient,
      remindProjectOwners,
      ...data
    } = await req.json();
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
        start,
        reminderTime: reminderTime || null,
      })
      .eq("id", id)
      .eq("organizationId", authUser.user_metadata.organizationId)
      .select("*")
      .single();

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
      });
    }

    if (remindProjectOwners && reminderDate) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: id,
        date: reminderDate.toISOString(),
        reminderTarget: "projectCreator",
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
      .eq("organizationId", authUser.user_metadata.organizationId);

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
