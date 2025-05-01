import { supabaseServiceRole } from "@lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { subDays, formatDistanceToNow } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    // Get current date and time
    const now = new Date();
    console.log("🚀 ~ GET ~ now:", now);
    const currentDateTime = now.toISOString();
    console.log("🚀 ~ GET ~ currentDateTime:", currentDateTime);

    // Fetch reminders that are due and not sent yet
    const { data: reminders, error: remindersError } = await supabaseServiceRole
      .from("CalendarEventReminder")
      .select(
        `
        *,
        User (
          email,
          phone,
          firstName,
          lastName
        ),
        CalendarEvent (
        users,
          subject,
          payload,
          start,
          Organization(phoneNumber, name),
          Project(adjusterEmail, adjusterPhoneNumber, clientEmail, clientPhoneNumber, clientName, adjusterName, name,location)
        )
      `
      )
      .lte("date", currentDateTime) // Check if reminder date is due
      .gte("date", subDays(new Date(), 1).toISOString()) // Check if reminder date is due
      .or("textSentAt.is.null,emailSentAt.is.null") // Either text or email not sent
      .not("date", "is", null); // Ensure date is not null
    console.log("🚀 ~ GET ~ reminders:", reminders);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError.message);
      return NextResponse.json(
        { error: remindersError.message },
        { status: 400 }
      );
    }

    // Process each reminder
    for (const reminder of reminders || []) {
      console.log("🚀 ~ POST ~ reminder:", reminder);
      const updates: Record<string, any> = {};
      const project = reminder.CalendarEvent?.Project;
      const organization = reminder.CalendarEvent?.Organization;

      // Determine recipient details based on reminderTarget
      let recipientEmail = "";
      let recipientPhone = "";
      let recipientName = "";

      if (reminder.reminderTarget === "client" && project) {
        recipientEmail = project.clientEmail;
        recipientPhone = project.clientPhoneNumber;
        recipientName = project.clientName;
      } else if (reminder.reminderTarget === "projectCreator" && project) {
        recipientEmail = project.adjusterEmail;
        recipientPhone = project.adjusterPhoneNumber;
        recipientName = project.adjusterName;
      } else if (reminder.reminderTarget === "allAssigned" && reminder.User) {
        recipientEmail = reminder.User?.email;
        recipientPhone = reminder.User.phone;
        recipientName = reminder.User.firstName + " " + reminder.User.lastName;
      }
      console.log("🚀 ~ POST ~ recipientPhone:", recipientPhone);

      // Send SMS if configured and not sent yet
      if (reminder.sendText && !reminder.textSentAt && recipientPhone) {
        try {
          const message = `Hi ${recipientName},\n\nThis is a reminder for your upcoming appointment:\n${
            reminder.CalendarEvent?.subject || "Calendar Event"
          }\n${reminder.CalendarEvent?.payload || ""} ${
            project?.location ? `\n\nLocation: ${project.location}` : ""
          }\n\nTime: ${reminder.CalendarEvent?.start ? formatDistanceToNow(new Date(reminder.CalendarEvent.start), { addSuffix: true }) : "Time not specified"}\n\nBest regards,\n${
            organization?.name || "RestoreGeek Team"
          }`;

          const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
          const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
          const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

          if (
            !TWILIO_ACCOUNT_SID ||
            !TWILIO_AUTH_TOKEN ||
            !TWILIO_PHONE_NUMBER
          ) {
            throw new Error("Twilio credentials not configured");
          }

          const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

          const formData = new URLSearchParams();
          formData.append("To", recipientPhone);
          formData.append("From", TWILIO_PHONE_NUMBER);
          formData.append("Body", message);

          const response = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
              ).toString("base64")}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          });

          if (response.ok) {
            updates.textSentAt = currentDateTime;
            console.log(`SMS sent to ${recipientName} at ${recipientPhone}`);
          } else {
            const errorData = await response.json();
            console.error("Failed to send SMS:", errorData);
          }
        } catch (error) {
          console.error("Failed to send SMS:", error);
        }
      }
      console.log("🚀 ~ POST ~ recipientPhone:", recipientPhone);

      //   // Send Email if configured and not sent yet
      //   if (reminder.sendEmail && !reminder.emailSentAt && recipientEmail) {
      //     try {
      //       const RESEND_API_KEY = process.env.RESEND_API_KEY;
      //       if (!RESEND_API_KEY) {
      //         throw new Error("Resend API key not configured");
      //       }

      //       const emailResponse = await fetch("https://api.resend.com/emails", {
      //         method: "POST",
      //         headers: {
      //           Authorization: `Bearer ${RESEND_API_KEY}`,
      //           "Content-Type": "application/json",
      //         },
      //         body: JSON.stringify({
      //           to: recipientEmail,
      //           from: "RestoreGeek <team@servicegeek.io>",
      //           subject: `Reminder: ${reminder.CalendarEvent?.subject || "Calendar Event"}`,
      //           html: `
      //             <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
      //               <h1 style="color: #4CAF50;">Calendar Event Reminder</h1>
      //               <p style="font-size: 16px;">Hi ${recipientName},</p>
      //               <h2>${reminder.CalendarEvent?.subject || "Calendar Event"}</h2>
      //               <p style="font-size: 16px;">${
      //                 reminder.CalendarEvent?.payload || ""
      //               }</p>
      //               <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 20px 0;">
      //                 <h3 style="color: #333; margin-top: 0;">Project Details</h3>
      //                 <p style="margin: 5px 0;"><strong>Project Name:</strong> ${
      //                   project?.name || ""
      //                 }</p>
      //               </div>
      //               <footer style="margin-top: 20px; font-size: 12px; color: #777;">
      //                 <p>Best regards,<br>${organization?.name || "RestoreGeek Team"}</p>
      //                 <p><a href="https://restoregeek.app" style="color: #4CAF50;">Visit our website</a></p>
      //               </footer>
      //             </div>
      //           `,
      //         }),
      //       });

      //       if (emailResponse.ok) {
      //         updates.emailSentAt = currentDateTime;
      //         console.log(`Email sent to ${recipientName} at ${recipientEmail}`);
      //       } else {
      //         const errorResponse = await emailResponse.json();
      //         console.error("Failed to send email:", errorResponse);
      //       }
      //     } catch (error) {
      //       console.error("Failed to send email:", error);
      //     }
      //   }

      // Update the reminder if any notifications were sent
      if (Object.keys(updates).length > 0) {
        await supabaseServiceRole
          .from("CalendarEventReminder")
          .update({
            ...updates,
            updatedAt: currentDateTime,
          })
          .eq("id", reminder.id);
      }
    }

    return NextResponse.json(
      { message: "Reminders processed successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing reminders:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}
