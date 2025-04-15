import { NextRequest, NextResponse } from "next/server";
import { twilio } from "@lib/twilio";
import { user } from "@/lib/supabase/get-user";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { formatCurrency } from "@lib/utils";
import { z } from "zod";

// Validate the request body
const requestSchema = z.object({
  phone: z.string().min(10),
  lineItems: z.array(z.number()).optional(),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user with the user function
    const [, authenticatedUser] = await user(request);
    if (!authenticatedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedBody = requestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { phone, lineItems: selectedLineItemIds, message } = parsedBody.data;
    const estimateId = params.id;

    // Get estimate and line items using Supabase
    const { data: estimate, error } = await supabaseServiceRole
      .from("Estimates")
      .select(
        `
        *,
        EstimateItems (*)
      `
      )
      .eq("publicId", estimateId)
      .eq(
        "organizationPublicId",
        authenticatedUser.user_metadata.organizationId
      )
      .single();

    if (error || !estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Filter line items if specific ones were requested
    const lineItemsToSend =
      selectedLineItemIds && selectedLineItemIds.length > 0
        ? estimate.EstimateItems.filter((item) =>
            selectedLineItemIds.includes(Number(item.id))
          )
        : estimate.EstimateItems;

    if (lineItemsToSend.length === 0) {
      return NextResponse.json(
        { error: "No line items to send" },
        { status: 400 }
      );
    }

    // Format line items for SMS
    let smsContent = `Estimate #${estimate.number} for ${estimate.clientName}:\n\n`;

    lineItemsToSend.forEach((item, index) => {
      smsContent += `${index + 1}. ${item.description}: ${formatCurrency(item.amount)}\n`;
    });

    // Add total amount
    const total = lineItemsToSend.reduce(
      (sum: number, item) => sum + item.amount,
      0
    );
    smsContent += `\nTotal: ${formatCurrency(total)}`;

    // Add custom message if provided
    if (message) {
      smsContent += `\n\n${message}`;
    }

    // Format phone number (ensure it has country code)
    let formattedPhone = phone.replace(/\D/g, "");
    if (!formattedPhone.startsWith("1") && formattedPhone.length === 10) {
      formattedPhone = `1${formattedPhone}`;
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Send SMS via Twilio
    await twilio.messages.create({
      body: smsContent,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
