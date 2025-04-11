import { NextRequest, NextResponse } from "next/server";
import { user } from "@lib/supabase/get-user";
import { supabaseServiceRole } from "@lib/supabase/admin";
import { Resend } from "resend";
import { RoomPlanEmailTemplate } from "@lib/novu/emails/room-plan-email";
import { PaymentDetailsEmailTemplate } from "@lib/novu/emails/payment-details-email";
import { Database } from "@/types/database";
import { convertSvgToPng } from "@lib/utils/imagekit";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

type Organization = Database["public"]["Tables"]["Organization"]["Row"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [_, authenticatedUser] = await user(req);
    const id = (await params).id;
    const body = await req.json();
    const roomId = body.roomId;

    // Get project details
    const { data: project, error: projectError } = await supabaseServiceRole
      .from("Project")
      .select("*")
      .eq("publicId", id)
      .single();

    if (projectError) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabaseServiceRole
      .from("Organization")
      .select("*")
      .eq("publicId", authenticatedUser.user_metadata.organizationId)
      .single();

    if (orgError) {
      console.error("Error fetching organization:", orgError);
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!organization.subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const { data: owner, error: ownerError } = await supabaseServiceRole
      .from("User")
      .select("*")
      .eq("accessLevel", "owner")
      .eq("organizationId", organization.id)
      .single();

    // if (ownerError) {
    //   console.error("Error fetching owner:", ownerError);
    //   return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    // }

    // Get room details
    const { data: room, error: roomError } = await supabaseServiceRole
      .from("Room")
      .select("*")
      .eq("publicId", roomId)
      .single();

    if (roomError) {
      console.error("Error fetching room:", roomError);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (!room.roomPlanSVG) {
      return NextResponse.json({ error: "Room plan SVG not found" }, { status: 404 });
    }

    // Convert SVG to PNG once
    const { url: pngUrl, buffer: pngBuffer } = await convertSvgToPng(room.roomPlanSVG);

    // Send room plan email using Resend
    const { data: roomPlanEmailData, error: roomPlanEmailError } = await resend.emails.send({
      from: "RestoreGeek <team@servicegeek.io>",
      to: "Files@restoregeek.io",
      subject: `Room Plan for ${project.name}`,
      react: await RoomPlanEmailTemplate({
        organization: {
          name: organization.name,
          phone: organization.phoneNumber || "Not provided",
          email: owner?.email || "Not provided",
          requestor: authenticatedUser.email || "Not provided",
        },
        project: {
          name: project.name,
          address: project.location || "Not provided",
          clientName: project.clientName,
        },
        roomPlanImage: pngUrl,
      }),
      attachments: [{
        filename: 'room-plan.png',
        content: pngBuffer,
      }],
    });

    if (roomPlanEmailError) {
      console.error("Error sending room plan email:", roomPlanEmailError);
      return NextResponse.json({ error: "Failed to send room plan email" }, { status: 500 });
    }

    // Get the ESX price ID from environment variables
    const esxPriceId = process.env.ESX_PRICE_KEY;
    if (!esxPriceId) {
      return NextResponse.json(
        { error: "ESX price ID not configured" },
        { status: 500 }
      );
    }

    if (!organization.customerId || !organization.subscriptionId) {
      return NextResponse.json(
        { error: "Organization has no valid customer or subscription ID" },
        { status: 400 }
      );
    }

    // Add the ESX price as a one-time charge to the subscription
    const invoiceItem = await stripe.invoiceItems.create({
      customer: organization.customerId,
      price: esxPriceId,
      subscription: organization.subscriptionId,
      description: `ESX Analysis for ${project.name} - Room ${roomId}`,
    });

    // Create an invoice to charge the customer immediately
    const invoice = await stripe.invoices.create({
      customer: organization.customerId,
      subscription: organization.subscriptionId,
      collection_method: 'charge_automatically',
      auto_advance: true,
    });

    // Finalize and pay the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    const paidInvoice = await stripe.invoices.pay(invoice.id);

    // Send payment notification email to files email
    const { data: paymentEmailData, error: paymentEmailError } = await resend.emails.send({
      from: "RestoreGeek <team@servicegeek.io>",
      to: "Files@restoregeek.io",
      subject: `ESX Analysis Payment Processed for ${project.name}`,
      react: PaymentDetailsEmailTemplate({
        organization: {
          name: organization.name,
          email: "Files@restoregeek.io",
        },
        project: {
          name: project.name,
          address: project.location || "Not provided",
        },
        paymentUrl: `https://dashboard.stripe.com/invoices/${invoice.id}`,
      }),
    });

    if (paymentEmailError) {
      console.error("Error sending payment notification email:", paymentEmailError);
      return NextResponse.json({ error: "Failed to send payment notification email" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      roomPlanEmailData,
      paymentEmailData,
      invoiceId: invoice.id
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 