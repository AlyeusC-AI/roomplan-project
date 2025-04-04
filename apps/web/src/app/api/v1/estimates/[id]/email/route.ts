import { NextRequest, NextResponse } from "next/server";
import { user } from "@/lib/supabase/get-user";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

// POST /api/v1/estimates/[id]/email - Email an estimate to the client
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user and get supabase client
    const [supabase, authenticatedUser] = await user(req);

    const estimateId = params.id;
    const { message } = await req.json();

    // Get the estimate with its items
    const { data: estimate, error: fetchError } = await supabase
      .from("Estimates")
      .select("*, EstimateItems(*)")
      .eq("publicId", estimateId)
      .eq("userId", authenticatedUser.id)
      .eq("isDeleted", false)
      .single();

    if (fetchError) {
      console.error("Error fetching estimate:", fetchError);
      return NextResponse.json(
        { error: "Estimate not found or access denied" },
        { status: 404 }
      );
    }

    // Check if client email exists
    if (!estimate.clientEmail) {
      return NextResponse.json(
        { error: "No client email address available" },
        { status: 400 }
      );
    }

    // Get organization details
    const client = await createClient();
    const organizationId = authenticatedUser.user_metadata.organizationId;

    const { data: organization, error: orgError } = await client
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
      estimate,
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
      to: estimate.clientEmail,
      subject: `Estimate #${estimate.number} from ${organization.name}`,
      html: emailHtml,
    });

    // Update estimate status to 'sent' if it's in draft
    if (estimate.status === "draft") {
      await supabase
        .from("Estimates")
        .update({ status: "sent" })
        .eq("publicId", estimateId);
    }

    return NextResponse.json({
      success: true,
      message: `Estimate emailed to ${estimate.clientEmail}`,
    });
  } catch (error) {
    console.error(`API error emailing estimate:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

function generateEmailTemplate(
  estimate: Estimate,
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Estimate from ${organization.name}</title>
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
        .estimate-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .estimate-details, .client-details {
          flex: 1;
        }
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
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #777;
          font-size: 0.9em;
          border-top: 1px solid #eaeaea;
          padding-top: 20px;
        }
        .button {
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
          .estimate-info {
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
          <h1>Estimate #${estimate.number}</h1>
          <p>From: <strong>${organization.name}</strong></p>
        </div>
        
        <div class="content">
          ${message ? `<div class="message">${message}</div>` : ""}
          
          <div class="estimate-info">
            <div class="client-details">
              <h3>Client</h3>
              <p>
                <strong>${estimate.clientName}</strong><br>
                ${estimate.clientEmail}
              </p>
            </div>
            
            <div class="estimate-details">
              <h3>Estimate Details</h3>
              <p>
                <strong>Date:</strong> ${formatDate(estimate.estimateDate ?? new Date().toISOString())}<br>
                <strong>Expiry:</strong> ${formatDate(estimate.expiryDate ?? new Date().toISOString())}<br>
                ${estimate.projectName ? `<strong>Project:</strong> ${estimate.projectName}<br>` : ""}
                ${estimate.poNumber ? `<strong>PO Number:</strong> ${estimate.poNumber}` : ""}
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
              ${estimate.EstimateItems.map(
                (item) => `
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
              <div class="total-value">${formatCurrency(estimate.subtotal)}</div>
            </div>
            
            ${
              estimate.markupAmount
                ? `
              <div class="total-row">
                <div class="total-label">Markup (${estimate.markupAmount}%):</div>
                <div class="total-value">${formatCurrency(estimate.subtotal * (estimate.markupAmount / 100))}</div>
              </div>
            `
                : ""
            }
            
            ${
              estimate.discountAmount
                ? `
              <div class="total-row">
                <div class="total-label">Discount:</div>
                <div class="total-value">-${formatCurrency(estimate.discountAmount)}</div>
              </div>
            `
                : ""
            }
            
            ${
              estimate.taxAmount
                ? `
              <div class="total-row">
                <div class="total-label">Tax (${estimate.taxAmount}%):</div>
                <div class="total-value">${formatCurrency(
                  estimate.amount -
                    estimate.subtotal +
                    (estimate.discountAmount || 0) -
                    estimate.subtotal * ((estimate.markupAmount || 0) / 100)
                )}</div>
              </div>
            `
                : ""
            }
            
            <div class="total-row grand-total">
              <div class="total-label">Total:</div>
              <div class="total-value">${formatCurrency(estimate.amount)}</div>
            </div>
            
            ${
              estimate.depositAmount
                ? `
              <div class="total-row">
                <div class="total-label">Deposit (${estimate.depositPercentage}%):</div>
                <div class="total-value">${formatCurrency(estimate.amount * (estimate.depositPercentage ?? 0 / 100))}</div>
              </div>
              <div class="total-row">
                <div class="total-label">Balance Due:</div>
                <div class="total-value">${formatCurrency(estimate.amount - estimate.amount * (estimate.depositPercentage ?? 0 / 100))}</div>
              </div>
            `
                : ""
            }
          </div>
          
          ${
            estimate.notes
              ? `
            <div style="margin-top: 20px;">
              <h3>Notes</h3>
              <p>${estimate.notes}</p>
            </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin-top: 30px;">
            <p>You can approve or decline this estimate by replying your contractor.</p>
          </div>
          
          <div class="organization-details">
            <h3>${organization.name}</h3>
            ${organization.address ? `<p>${organization.address}</p>` : ""}
            ${organization.phoneNumber ? `<p>Phone: ${organization.phoneNumber}</p>` : ""}
            ${authenticatedUser.email ? `<p>Email: ${authenticatedUser.email}</p>` : ""}
          </div>
        </div>
        
        <div class="footer">
          <p>This estimate was sent using ServiceGeek</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
