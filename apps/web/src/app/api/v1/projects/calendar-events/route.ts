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
      reminderDate,
      projectId,
      end,
    } = await req.json();
    const [, authUser] = await user(req);

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
      })
      .select("*")
      .single();

    if (remindClient) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: results.data!.id,
        date: reminderDate,
        reminderTarget: "client",
      });
    }

    if (remindProjectOwners) {
      await supabaseServiceRole.from("CalendarEventReminder").insert({
        calendarEventId: results.data!.id,
        date: reminderDate,
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
    const { id, ...data } = await req.json();
    const [, authUser] = await user(req);

    const results = await supabaseServiceRole
      .from("CalendarEvent")
      .update(data)
      .eq("id", id)
      .eq("organizationId", authUser.user_metadata.organizationId)
      .select("*")
      .single();

    // if (remindClient) {
    //   await supabaseServiceRole.from("CalendarEventReminder").insert({
    //     calendarEventId: results.data!.id,
    //     date: reminderDate,
    //     reminderTarget: "client",
    //   });
    // }

    // if (remindProjectOwners) {
    //   await supabaseServiceRole.from("CalendarEventReminder").insert({
    //     calendarEventId: results.data!.id,
    //     date: reminderDate,
    //     reminderTarget: "projectCreator",
    //   });
    // }

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
