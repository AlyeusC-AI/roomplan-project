import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { supabaseServiceRole } from "@lib/supabase/admin";

// POST /api/v1/invoices/[publicId]/email - Email an invoice to the client
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Authenticate the user and get supabase client
    const [supabase, authenticatedUser] = await user(req);

    const invoiceId = (await params).publicId;
    const { message } = await req.json();

    // Get the invoice with its items
    const { data: invoice, error: fetchError } = await supabase
      .from("Invoices")
      .select("*, InvoiceItems(*)")
      .eq("publicId", invoiceId)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .single();

    if (fetchError) {
      console.error("Error fetching invoice:", fetchError);
      return NextResponse.json(
        { error: "Invoice not found or access denied" },
        { status: 404 }
      );
    }

    // Check if client email exists
    if (!invoice.clientEmail) {
      return NextResponse.json(
        { error: "No client email address available" },
        { status: 400 }
      );
    }

    // Get organization details
    const client = await createClient();
    const organizationId = authenticatedUser.user_metadata.organizationId;
    

    const { data: organization, error: orgError } = await supabaseServiceRole
      .from("Organization")
      .select()
      .eq("publicId", organizationId)
      .single();

    if (orgError) {
      console.error("Error fetching organization:", orgError);
      return NextResponse.json(
        { error: "Could not retrieve organization details" },
        { status: 500 }
      );
    }

    // Create HTML email template
    const emailHtml = generateEmailTemplate(
      invoice,
      organization,
      authenticatedUser,
      message
    );

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Boolean(process.env.SMTP_SECURE) || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"${organization.name}" <${process.env.SMTP_USER}>`,
      to: invoice.clientEmail,
      subject: `Invoice #${invoice.number} from ${organization.name}`,
      html: emailHtml,
    });

    // Update invoice status to 'sent' if it's in draft
    if (invoice.status === "draft") {
      await supabase
        .from("Invoices")
        .update({ status: "sent" })
        .eq("publicId", invoiceId);
    }

    return NextResponse.json({
      success: true,
      message: `Invoice emailed to ${invoice.clientEmail}`,
    });
  } catch (error) {
    console.error(`API error emailing invoice:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

function generateEmailTemplate(
  invoice: Invoice,
  organization: Organization,
  authenticatedUser: User,
  message?: string
) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate total paid amount (if needed for future use)
  // const calculateDueAmount = (total: number, paid: number = 0) => {
  //   return total - paid;
  // };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice from ${organization.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 650px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eaeaea;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 200px;
          height: auto;
        }
        .header h1 {
          color: #333;
          margin-top: 0;
        }
        .content {
          padding: 0 20px;
        }
        .message {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          border-left: 4px solid #2563eb;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .invoice-details, .client-details {
          flex: 1;
        }
        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.9em;
          text-transform: uppercase;
          margin-top: 10px;
        }
        .status-draft { background-color: #f3f4f6; color: #6b7280; }
        .status-sent { background-color: #dbeafe; color: #1e40af; }
        .status-paid { background-color: #d1fae5; color: #065f46; }
        .status-overdue { background-color: #fee2e2; color: #b91c1c; }
        .status-cancelled { background-color: #fef3c7; color: #92400e; }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .table th {
          background-color: #f2f2f2;
          text-align: left;
          padding: 10px;
        }
        .table td {
          padding: 10px;
          border-bottom: 1px solid #eaeaea;
        }
        .total-section {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 5px;
        }
        .total-label {
          width: 150px;
          text-align: left;
          font-weight: normal;
        }
        .total-value {
          width: 100px;
          text-align: right;
        }
        .grand-total {
          font-weight: bold;
          font-size: 1.1em;
          border-top: 2px solid #eaeaea;
          padding-top: 5px;
        }
        .payment-section {
          margin-top: 30px;
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 5px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #777;
          font-size: 0.9em;
          border-top: 1px solid #eaeaea;
          padding-top: 20px;
        }
        .payment-button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 500;
          margin-top: 15px;
        }
        .organization-details {
          margin-top: 30px;
          font-size: 0.9em;
          color: #555;
        }
        @media only screen and (max-width: 600px) {
          .invoice-info {
            flex-direction: column;
          }
          .total-section {
            padding-right: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice #${invoice.number}</h1>
          <p>From: <strong>${organization.name}</strong></p>
          <div class="status status-${invoice.status}">
            ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </div>
        </div>
        
        <div class="content">
          ${message ? `<div class="message">${message}</div>` : ""}
          
          <div class="invoice-info">
            <div class="client-details">
              <h3>Client</h3>
              <p>
                <strong>${invoice.clientName}</strong><br>
                ${invoice.clientEmail}
              </p>
            </div>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p>
                <strong>Date:</strong> ${formatDate(invoice.invoiceDate ?? new Date().toISOString())}<br>
                <strong>Due:</strong> ${formatDate(invoice.dueDate ?? new Date().toISOString())}<br>
                ${invoice.projectName ? `<strong>Project:</strong> ${invoice.projectName}<br>` : ""}
                ${invoice.poNumber ? `<strong>PO Number:</strong> ${invoice.poNumber}` : ""}
              </p>
            </div>
          </div>
          
          <h3>Items</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.InvoiceItems.map(
                (item: InvoiceItem) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.rate)}</td>
                  <td>${formatCurrency(item.amount)}</td>
                </tr>
              `
              ).join("")}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <div class="total-label">Subtotal:</div>
              <div class="total-value">${formatCurrency(invoice.subtotal)}</div>
            </div>
            
            ${
              invoice.markupPercentage
                ? `
              <div class="total-row">
                <div class="total-label">Markup (${invoice.markupPercentage}%):</div>
                <div class="total-value">${formatCurrency(invoice.subtotal * (invoice.markupPercentage / 100))}</div>
              </div>
            `
                : ""
            }
            
            ${
              invoice.discountAmount
                ? `
              <div class="total-row">
                <div class="total-label">Discount:</div>
                <div class="total-value">-${formatCurrency(invoice.discountAmount)}</div>
              </div>
            `
                : ""
            }
            
            ${
              invoice.taxRate
                ? `
              <div class="total-row">
                <div class="total-label">Tax (${invoice.taxRate}%):</div>
                <div class="total-value">${formatCurrency(invoice.taxAmount || 0)}</div>
              </div>
            `
                : ""
            }
            
            <div class="total-row grand-total">
              <div class="total-label">Total:</div>
              <div class="total-value">${formatCurrency(invoice.amount)}</div>
            </div>
            
            ${
              invoice.depositAmount
                ? `
              <div class="total-row">
                <div class="total-label">Deposit Paid:</div>
                <div class="total-value">${formatCurrency(invoice.depositAmount)}</div>
              </div>
              <div class="total-row">
                <div class="total-label">Balance Due:</div>
                <div class="total-value">${formatCurrency(invoice.amount - invoice.depositAmount)}</div>
              </div>
            `
                : ""
            }
          </div>
          
          ${
            invoice.notes
              ? `
            <div style="margin-top: 20px;">
              <h3>Notes</h3>
              <p>${invoice.notes}</p>
            </div>
          `
              : ""
          }

                    
          ${
            invoice.terms
              ? `
            <div style="margin-top: 20px;">
              <h3>Terms</h3>
              <p>${invoice.terms}</p>
            </div>
          `
              : ""
          }
          
          <div class="payment-section">
            <h3>Payment Information</h3>
            <p>Please make payment by the due date: <strong>${formatDate(invoice.dueDate)}</strong></p>
            <p>If you have any questions about this invoice, please contact us.</p>
          </div>
          
          <div class="organization-details">
            <h3>${organization.name}</h3>
            ${organization.address ? `<p>${organization.address}</p>` : ""}
            ${organization.phoneNumber ? `<p>Phone: ${organization.phoneNumber}</p>` : ""}
            ${authenticatedUser.email ? `<p>Email: ${authenticatedUser.email}</p>` : ""}
          </div>
        </div>
        
        <div class="footer">
          <p>This invoice was sent using ServiceGeek</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
