import { NextRequest, NextResponse } from "next/server";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { user } from "@lib/supabase/get-user";
import { twilio } from "@lib/twilio";

export type NotificationType = "arrival" | "start_work" | "complete_work";

interface NotificationRequest {
  projectId: string;
  eventId: string;
  message: string;
  phoneNumber: string;
  notificationType: NotificationType;
  arrivalTime?: number;
  status?: "heading" | "late";
}

export async function POST(request: NextRequest) {
  await user(request);

  try {
    const body: NotificationRequest = await request.json();
    const {
      projectId,
      eventId,
      message,
      phoneNumber,
      notificationType,
      arrivalTime,
      status,
    } = body;

    if (!projectId || !eventId || !message || !phoneNumber || !notificationType) {
      return NextResponse.json(
        { status: "failed", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format the phone number (ensure it has country code)
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    // Send SMS via Twilio
    const response = await twilio.messages.create({
      to: formattedPhoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    });

    if (!response.sid) {
      throw new Error("Failed to send SMS");
    }

    // Save notification record to database
    // const { error: notificationError } = await supabaseServiceRole
    //   .from("SMSNotifications")
    //   .insert({
    //     projectId: parseInt(projectId),
    //     eventId: parseInt(eventId),
    //     message,
    //     notificationType,
    //     phoneNumber: formattedPhoneNumber,
    //     ...(notificationType === "arrival" && { arrivalTime, status }),
    //   });

    // if (notificationError) {
    //   console.error("Error saving notification:", notificationError);
    //   // Don't throw here, as the SMS was sent successfully
    // }

    return NextResponse.json({
      status: "ok",
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { status: "failed", message: "Failed to send notification" },
      { status: 500 }
    );
  }
}

// Helper function to format phone number
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // Ensure it has the US country code if needed
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  // If it already has a country code, just ensure it starts with +
  if (digitsOnly.startsWith("1")) {
    return `+${digitsOnly}`;
  }

  return `+${digitsOnly}`;
} 