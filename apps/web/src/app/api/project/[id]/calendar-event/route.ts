// import { NextRequest, NextResponse } from "next/server";
// import { v4 } from "uuid";

import { NextRequest, NextResponse } from "next/server";

// export type CalendarEventPostBody = {
//   subject: string;
//   payload: string;
//   remindProjectOwners: boolean;
//   date: string;
//   reminderDate: string;
//   remindClient: boolean;
//   localizedTimeString: string;
// };

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     console.error("Session does not exist.");
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
//   const body = await req.json();
//   const projectId = (await params).id;
//   if (Array.isArray(projectId) || !projectId) {
//     return NextResponse.json(
//       { status: "failed", reason: "invalid query param" },
//       { status: 400 }
//     );
//   }

//   try {
//     const {
//       subject,
//       payload,
//       remindProjectOwners,
//       remindClient,
//       date,
//       reminderDate,
//     } = body as CalendarEventPostBody;

//     const event = await supabase
//       .from("CalendarEvent")
//       .insert({
//         subject: subject,
//         remindClient,
//         remindProjectOwners,
//         date,
//         publicId: v4(),
//         payload,
//         dynamicId: v4(),
//         organizationId: user.user_metadata.organizationId,
//       })
//       .select("*")
//       .single();

//     if (remindClient || remindProjectOwners) {
//       supabase.from("CalendarEventReminder").insert({
//         calendarEventId: event.data?.id,
//         reminderTarget:
//           remindClient && remindProjectOwners
//             ? "allAssigned"
//             : remindClient
//               ? "client"
//               : "projectCreator",
//         sendEmail: true,
//         sendText: true,
//         date: reminderDate,
//       });
//     }

//     // const calendarEvent = await createCalendarEvent({
//     //   userId: user.id,
//     //   projectId,
//     //   data: {
//     //     subject,
//     //     payload,
//     //     remindProjectOwners: remindProjectOwners || false,
//     //     remindClient: remindClient || false,
//     //     date, // in unix time
//     //     reminderDate: reminderDate, // in unix time,
//     //     localizedTimeString,
//     //   },
//     // });

//     // if (!calendarEvent) {
//     //   return NextResponse.json({ status: "failed" }, { status: 500 });
//     // }

//     NextResponse.json({
//       status: "ok",
//       calendarEvent: event.data,
//     });
//     return;
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
// }

// export type CalendarEventPatchBody = {
//   projectId: string;
//   calendarEventPublicId: string;
//   subject?: string;
//   payload?: string;
//   remindProjectOwners?: boolean;
//   date?: number;
//   reminderDate?: number;
//   remindClient?: boolean;
//   localizedTimeString: string;
// };

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     console.error("Session does not exist.");
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
//   const projectId = (await params).id;
//   if (Array.isArray(projectId) || !projectId) {
//     return NextResponse.json(
//       { status: "failed", reason: "invalid query param" },
//       { status: 400 }
//     );
//   }

//   try {
//     const {
//       subject,
//       payload,
//       remindProjectOwners,
//       remindClient,
//       date,
//       reminderDate,
//       calendarEventPublicId,
//       localizedTimeString,
//     }: CalendarEventPatchBody = await req.json();

//     await updateCalendarEvent({
//       userId: user.id,
//       projectId,
//       data: {
//         calendarEventPublicId,
//         subject,
//         payload,
//         remindProjectOwners,
//         remindClient,
//         date: date, // in unix time
//         reminderDate: reminderDate, // in unix time
//         localizedTimeString,
//       },
//     });

//     return NextResponse.json({ status: "ok" }, { status: 200 });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
// }

// export type CalendarEventDeleteBody = {
//   calendarEventPublicId: string;
// };

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     console.error("Session does not exist.");
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
//   const projectId = (await params).id;
//   if (Array.isArray(projectId) || !projectId) {
//     return NextResponse.json(
//       { status: "failed", reason: "invalid query param" },
//       { status: 400 }
//     );
//   }

//   try {
//     const { calendarEventPublicId }: CalendarEventDeleteBody = await req.json();

//     await deleteCalendarEvent({
//       userId: user.id,
//       projectId,
//       calendarEventPublicId,
//     });

//     return NextResponse.json({ status: "ok" });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
// }

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     console.error("Session does not exist.");
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
//   const projectId = (await params).id;
//   if (Array.isArray(projectId) || !projectId) {
//     return NextResponse.json(
//       { status: "failed", reason: "invalid query param" },
//       { status: 400 }
//     );
//   }
//   try {
//     const res = await supabase
//       .from("CalendarEvent")
//       .select("*")
//       .eq("organizationId", user.user_metadata.organizationId)
//       .eq("projectId", projectId);

//     if (!res.data) {
//       return NextResponse.json({ status: "failed" }, { status: 500 });
//     }

//     return NextResponse.json({ data: res.data, status: "ok" });
//   } catch (err) {
//     console.error("err", err);
//     return NextResponse.json({ status: "failed" }, { status: 500 });
//   }
// }
export async function POST(req: NextRequest) {
  return NextResponse.json({ status: "ok" });
}