import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import { Twilio } from "npm:twilio@3.84.1";

const twilioClient = new Twilio(
  Deno.env.get("TWILIO_ACCOUNT_SID")!,
  Deno.env.get("TWILIO_AUTH_TOKEN")!
);

Deno.serve(async (req: Request) => {
  if (req.method === "POST") {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Get current date and time
    const now = new Date();
    const currentDateTime = now.toISOString();

    // Fetch reminders that are due and not sent yet
    const { data: reminders, error: remindersError } = await supabaseClient
      .from("CalendarEventReminder")
      .select(
        `
        *,
        CalendarEvent (
          title,
          description,
          Organization(phoneNumber, name),
          Project(adjusterEmail, adjusterPhone, clientEmail, clientPhone, clientName, adjusterName, name)
        )
      `
      )
      .lte("date", currentDateTime) // Check if reminder date is due
      .or("textSentAt.is.null,emailSentAt.is.null") // Either text or email not sent
      .not("date", "is", null); // Ensure date is not null

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError.message);
      return new Response(JSON.stringify({ error: remindersError.message }), {
        status: 400,
      });
    }

    // Process each reminder
    for (const reminder of reminders) {
      const updates: Record<string, any> = {};
      const project = reminder.calendarEvent?.Project;
      const organization = reminder.calendarEvent?.Organization;

      // Determine recipient details based on reminderTarget
      let recipientEmail = "";
      let recipientPhone = "";
      let recipientName = "";

      if (reminder.reminderTarget === "client" && project) {
        recipientEmail = project.clientEmail;
        recipientPhone = project.clientPhone;
        recipientName = project.clientName;
      } else if (reminder.reminderTarget === "projectCreator" && project) {
        recipientEmail = project.adjusterEmail;
        recipientPhone = project.adjusterPhone;
        recipientName = project.adjusterName;
      }

      // Send SMS if configured and not sent yet
      if (reminder.sendText && !reminder.textSentAt && recipientPhone) {
        try {
          const message = `Hi ${recipientName},\n\nThis is a reminder for your upcoming appointment:\n${
            reminder.calendarEvent?.title || "Calendar Event"
          }\n${reminder.calendarEvent?.description || ""}\n\nProject: ${
            project?.name || ""
          }\n\nBest regards,\n${organization?.name || "RestoreGeek Team"}`;

          await twilioClient.messages.create({
            body: message,
            from: Deno.env.get("TWILIO_PHONE_NUMBER")!,
            to: recipientPhone,
          });
          updates.textSentAt = currentDateTime;
          console.log(`SMS sent to ${recipientName} at ${recipientPhone}`);
        } catch (error) {
          console.error("Failed to send SMS:", error);
        }
      }

      // Send Email if configured and not sent yet
      if (reminder.sendEmail && !reminder.emailSentAt && recipientEmail) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")!}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: recipientEmail,
              subject: `Reminder: ${reminder.calendarEvent?.title || "Calendar Event"}`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
                  <h1 style="color: #4CAF50;">Calendar Event Reminder</h1>
                  <p style="font-size: 16px;">Hi ${recipientName},</p>
                  <h2>${reminder.calendarEvent?.title || "Calendar Event"}</h2>
                  <p style="font-size: 16px;">${
                    reminder.calendarEvent?.description || ""
                  }</p>
                  <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Project Details</h3>
                    <p style="margin: 5px 0;"><strong>Project Name:</strong> ${
                      project?.name || ""
                    }</p>
                  </div>
                  <footer style="margin-top: 20px; font-size: 12px; color: #777;">
                    <p>Best regards,<br>${organization?.name || "RestoreGeek Team"}</p>
                    <p><a href="https://restoregeek.com" style="color: #4CAF50;">Visit our website</a></p>
                  </footer>
                </div>
              `,
            }),
          });

          if (emailResponse.ok) {
            updates.emailSentAt = currentDateTime;
            console.log(`Email sent to ${recipientName} at ${recipientEmail}`);
          } else {
            const errorResponse = await emailResponse.json();
            console.error("Failed to send email:", errorResponse);
          }
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      }

      // Update the reminder if any notifications were sent
      if (Object.keys(updates).length > 0) {
        await supabaseClient
          .from("CalendarEventReminder")
          .update({
            ...updates,
            updatedAt: currentDateTime,
          })
          .eq("id", reminder.id);
      }
    }

    return new Response(
      JSON.stringify({ message: "Reminders processed successfully!" }),
      { status: 200 }
    );
  }

  return new Response("Method not allowed", { status: 405 });
});
