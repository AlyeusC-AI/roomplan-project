import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { Invoice, Organization, Project } from '@prisma/client';

interface SendDocumentEmailParams {
  to: string;
  documentName: string;
  projectName: string;
  organizationName: string;
  organizationPhone: string;
  previewLink: string;
  html?: string;
}

interface SendInvoiceEmailParams {
  to: string;
  invoice: Invoice & {
    organization: Organization;
    project: Project | null;
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
  };
  message?: string;
}

interface SendEstimateEmailParams {
  to: string;
  estimate: any; // TODO: Replace with proper Estimate type
  message?: string;
}

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly LOGO_URL =
    'https://www.restoregeek.app/_next/image?url=%2Fimages%2Fbrand%2Fservicegeek-no-bg.png&w=256&q=75';

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  private getEmailStyles() {
    return `
      <style>
        .email-container {
          font-family: 'Segoe UI', Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #ffffff;
          color: #333333;
        }
        .email-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 180px;
          height: auto;
          margin-bottom: 20px;
        }
        .email-title {
          color: #2c3e50;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .email-content {
          line-height: 1.6;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .button {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #2980b9;
        }
        .email-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .list {
          margin: 20px 0;
          padding-left: 20px;
        }
        .list-item {
          margin-bottom: 10px;
        }
      </style>
    `;
  }

  async sendOrganizationInvitation(
    to: string,
    organizationName: string,
    inviterName: string,
    invitationLink: string,
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'RestoreGeek <team@servicegeek.io>',
        to: [to],
        subject: `You've been invited to join ${organizationName}`,
        html: `
          ${this.getEmailStyles()}
          <div class="email-container">
            <div class="email-header">
              <img src="${this.LOGO_URL}" alt="RestoreGeek Logo" class="logo">
              <h1 class="email-title">Organization Invitation</h1>
            </div>
            <div class="email-content">
              <p>Hello,</p>
              <p>${inviterName} has invited you to join their organization <strong>"${organizationName}"</strong> on RestoreGeek.</p>
              <p>We're excited to have you join our community of professionals!</p>
              <div class="button-container">
                <a href="${invitationLink}" class="button">
                  Accept Invitation
                </a>
              </div>
              <p>If you don't want to join, you can simply ignore this email.</p>
            </div>
            <div class="email-footer">
              <p>Best regards,<br>The RestoreGeek Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send invitation email');
      }

      return data;
    } catch (error) {
      console.error('Error in sendOrganizationInvitation:', error);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, verificationLink: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'RestoreGeek <team@servicegeek.io>',
        to: [to],
        subject: 'Verify your email address',
        html: `
          ${this.getEmailStyles()}
          <div class="email-container">
            <div class="email-header">
              <img src="${this.LOGO_URL}" alt="RestoreGeek Logo" class="logo">
              <h1 class="email-title">Email Verification</h1>
            </div>
            <div class="email-content">
              <p>Hello,</p>
              <p>Thank you for signing up with RestoreGeek. To ensure the security of your account, please verify your email address by clicking the button below:</p>
              <div class="button-container">
                <a href="${verificationLink}" class="button">
                  Verify Email
                </a>
              </div>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="email-footer">
              <p>Best regards,<br>The RestoreGeek Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
      }

      return data;
    } catch (error) {
      console.error('Error in sendVerificationEmail:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'RestoreGeek <team@servicegeek.io>',
        to: [to],
        subject: 'Reset your password',
        html: `
          ${this.getEmailStyles()}
          <div class="email-container">
            <div class="email-header">
              <img src="${this.LOGO_URL}" alt="RestoreGeek Logo" class="logo">
              <h1 class="email-title">Password Reset</h1>
            </div>
            <div class="email-content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div class="button-container">
                <a href="${resetLink}" class="button">
                  Reset Password
                </a>
              </div>
              <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="email-footer">
              <p>Best regards,<br>The RestoreGeek Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
      }

      return data;
    } catch (error) {
      console.error('Error in sendPasswordResetEmail:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'RestoreGeek <team@servicegeek.io>',
        to: [to],
        subject: 'Welcome to RestoreGeek!',
        html: `
          ${this.getEmailStyles()}
          <div class="email-container">
            <div class="email-header">
              <img src="${this.LOGO_URL}" alt="RestoreGeek Logo" class="logo">
              <h1 class="email-title">Welcome to RestoreGeek!</h1>
            </div>
            <div class="email-content">
              <p>Hello ${firstName},</p>
              <p>Welcome to RestoreGeek! We're thrilled to have you join our community of professionals.</p>
              <p>Here are a few things you can do to get started:</p>
              <ul class="list">
                <li class="list-item">Complete your profile to showcase your expertise</li>
                <li class="list-item">Create or join an organization to collaborate</li>
                <li class="list-item">Explore our features and discover new possibilities</li>
              </ul>
              <p>If you have any questions or need assistance, our support team is here to help.</p>
            </div>
            <div class="email-footer">
              <p>Best regards,<br>The RestoreGeek Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        throw new Error('Failed to send welcome email');
      }

      return data;
    } catch (error) {
      console.error('Error in sendWelcomeEmail:', error);
      throw error;
    }
  }

  async sendDocumentEmail({
    to,
    documentName,
    projectName,
    organizationName,
    organizationPhone,
    previewLink,
    html,
  }: SendDocumentEmailParams) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'RestoreGeek <team@servicegeek.io>',
        to: [to],
        subject: `Document: ${documentName}`,
        html:
          html ||
          `
          ${this.getEmailStyles()}
          <div class="email-container">
            <div class="email-header">
              <img src="${this.LOGO_URL}" alt="RestoreGeek Logo" class="logo">
              <h1 class="email-title">Document Shared with You</h1>
            </div>
            <div class="email-content">
              <p>Hello,</p>
              <p>${organizationName} has shared a document with you for the project "${projectName}".</p>
              <div class="button-container">
                <a href="${previewLink}" class="button">
                  View Document
                </a>
              </div>
            </div>
            <div class="email-footer">
              <p>If you have any questions, please contact ${organizationName} at ${organizationPhone}.</p>
              <p>Best regards,<br>The RestoreGeek Team</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Error sending document email:', error);
        throw new Error('Failed to send document email');
      }

      return data;
    } catch (error) {
      console.error('Error in sendDocumentEmail:', error);
      throw error;
    }
  }

  async sendInvoiceEmail({ to, invoice, message }: SendInvoiceEmailParams) {
    try {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      };

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice #${invoice.number} from ${invoice.organization.name}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 800px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0;
              opacity: 0.9;
            }
            .content {
              padding: 40px;
            }
            .message {
              background-color: #f8fafc;
              border-left: 4px solid #2563eb;
              padding: 20px;
              margin-bottom: 30px;
              border-radius: 0 8px 8px 0;
            }
            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 40px;
            }
            .info-section h3 {
              color: #1e40af;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .info-section p {
              margin: 8px 0;
              color: #4b5563;
            }
            .status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
              text-transform: uppercase;
              margin-top: 10px;
            }
            .status-draft { background-color: #f3f4f6; color: #6b7280; }
            .status-sent { background-color: #dbeafe; color: #1e40af; }
            .status-paid { background-color: #d1fae5; color: #065f46; }
            .status-overdue { background-color: #fee2e2; color: #b91c1c; }
            .status-cancelled { background-color: #fef3c7; color: #92400e; }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .items-table th {
              background-color: #f8fafc;
              color: #1e40af;
              font-weight: 600;
              text-align: left;
              padding: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            .items-table td {
              padding: 15px;
              border-bottom: 1px solid #e5e7eb;
              color: #4b5563;
            }
            .items-table tr:last-child td {
              border-bottom: none;
            }
            .total-section {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-top: 30px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              color: #4b5563;
            }
            .total-row.grand-total {
              border-top: 2px solid #e5e7eb;
              margin-top: 10px;
              padding-top: 15px;
              font-weight: 600;
              color: #1a1a1a;
              font-size: 18px;
            }
            .payment-section {
              background-color: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 8px;
              padding: 25px;
              margin-top: 40px;
            }
            .payment-section h3 {
              color: #0369a1;
              margin-top: 0;
            }
            .payment-button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              margin-top: 15px;
              transition: background-color 0.2s;
            }
            .payment-button:hover {
              background-color: #1d4ed8;
            }
            .footer {
              background-color: #f8fafc;
              padding: 30px;
              text-align: center;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            .organization-details {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .organization-details h3 {
              color: #1e40af;
              margin-bottom: 15px;
            }
            .organization-details p {
              margin: 8px 0;
              color: #4b5563;
            }
            @media only screen and (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 8px;
              }
              .content {
                padding: 20px;
              }
              .invoice-info {
                grid-template-columns: 1fr;
                gap: 20px;
              }
              .items-table {
                display: block;
                overflow-x: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice #${invoice.number}</h1>
              <p>${invoice.organization.name}</p>
              <div class="status status-${invoice.status.toLowerCase()}">
                ${invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
              </div>
            </div>
            
            <div class="content">
              ${message ? `<div class="message">${message}</div>` : ''}
              
              <div class="invoice-info">
                <div class="info-section">
                  <h3>Client Information</h3>
                  <p><strong>${invoice.clientName}</strong></p>
                  <p>${invoice.clientEmail}</p>
                </div>
                
                <div class="info-section">
                  <h3>Invoice Details</h3>
                  <p><strong>Date:</strong> ${formatDate(new Date(invoice.invoiceDate))}</p>
                  <p><strong>Due Date:</strong> ${formatDate(new Date(invoice.dueDate))}</p>
                  ${invoice.project ? `<p><strong>Project:</strong> ${invoice.project.name}</p>` : ''}
                  ${invoice.poNumber ? `<p><strong>PO Number:</strong> ${invoice.poNumber}</p>` : ''}
                </div>
              </div>
              
              <h3>Items</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.description}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.rate)}</td>
                      <td>${formatCurrency(item.amount)}</td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(invoice.subtotal)}</span>
                </div>
                ${
                  invoice.discount
                    ? `
                  <div class="total-row">
                    <span>Discount:</span>
                    <span>-${formatCurrency(invoice.discount)}</span>
                  </div>
                `
                    : ''
                }
                ${
                  invoice.tax
                    ? `
                  <div class="total-row">
                    <span>Tax:</span>
                    <span>${invoice.tax / 100}% (${formatCurrency((invoice.tax / 100) * invoice.subtotal)})</span>
                  </div>
                `
                    : ''
                }
                <div class="total-row grand-total">
                  <span>Total:</span>
                  <span>${formatCurrency(invoice.total)}</span>
                </div>
                ${
                  invoice.deposit
                    ? `
                  <div class="total-row">
                    <span>Deposit Paid:</span>
                    <span>${formatCurrency(invoice.deposit)}</span>
                  </div>
                  <div class="total-row">
                    <span>Balance Due:</span>
                    <span>${formatCurrency(invoice.total - invoice.deposit)}</span>
                  </div>
                `
                    : ''
                }
              </div>
              
              ${
                invoice.notes
                  ? `
                <div style="margin-top: 30px;">
                  <h3>Notes</h3>
                  <p>${invoice.notes}</p>
                </div>
              `
                  : ''
              }
              
              ${
                invoice.terms
                  ? `
                <div style="margin-top: 30px;">
                  <h3>Terms</h3>
                  <p>${invoice.terms}</p>
                </div>
              `
                  : ''
              }
              
              <div class="payment-section">
                <h3>Payment Information</h3>
                <p>Please make payment by the due date: <strong>${formatDate(new Date(invoice.dueDate))}</strong></p>
                <p>If you have any questions about this invoice, please contact us.</p>
                <a href="${process.env.FRONTEND_URL}/invoices/${invoice.id}" class="payment-button">View Invoice Online</a>
              </div>
              
              <div class="organization-details">
                <h3>${invoice.organization.name}</h3>
                ${invoice.organization.address ? `<p>${invoice.organization.address}</p>` : ''}
                ${invoice.organization.phoneNumber ? `<p>Phone: ${invoice.organization.phoneNumber}</p>` : ''}
              </div>
            </div>
            
            <div class="footer">
              <p>This invoice was sent using ServiceGeek</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await this.resend.emails.send({
        from: 'RestoreGeek <team@servicegeek.io>',
        to: [to],
        subject: `Invoice #${invoice.number} from ${invoice.organization.name}`,
        html: emailHtml,
      });

      if (error) {
        console.error('Error sending invoice email:', error);
        throw new Error('Failed to send invoice email');
      }

      return data;
    } catch (error) {
      console.error('Error in sendInvoiceEmail:', error);
      throw error;
    }
  }

  async sendEstimateEmail({
    to,
    estimate,
    message,
  }: SendEstimateEmailParams): Promise<void> {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date));
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estimate #${estimate.number}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .section {
              margin-bottom: 20px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
            }
            .status-draft { background-color: #e5e7eb; color: #374151; }
            .status-sent { background-color: #dbeafe; color: #1e40af; }
            .status-approved { background-color: #dcfce7; color: #166534; }
            .status-rejected { background-color: #fee2e2; color: #991b1b; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background-color: #f9fafb;
              font-weight: 500;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin: 4px 0;
            }
            .total-label {
              width: 150px;
              text-align: right;
              padding-right: 20px;
            }
            .total-value {
              width: 100px;
              text-align: right;
              font-weight: 500;
            }
            .grand-total {
              font-size: 18px;
              font-weight: 600;
              color: #1e40af;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Estimate #${estimate.number}</h1>
              <span class="status status-${estimate.status.toLowerCase()}">${estimate.status}</span>
            </div>
            
            <div class="content">
              ${message ? `<div class="section">${message}</div>` : ''}
              
              <div class="section">
                <div class="grid">
                  <div>
                    <h3>Client Information</h3>
                    <p><strong>${estimate.clientName}</strong></p>
                    <p>${estimate.clientEmail}</p>
                  </div>
                  <div>
                    <h3>Estimate Details</h3>
                    <p><strong>Date:</strong> ${formatDate(estimate.estimateDate)}</p>
                    <p><strong>Project:</strong> ${estimate.project?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>Items</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${estimate.items
                      .map(
                        (item: any) => `
                      <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.rate)}</td>
                        <td>${formatCurrency(item.amount)}</td>
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                </table>

                <div class="totals">
                  <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value">${formatCurrency(estimate.subtotal)}</span>
                  </div>
                  ${
                    estimate.markup
                      ? `
                    <div class="total-row">
                      <span class="total-label">Markup:</span>
                      <span class="total-value">${estimate.markup}% (${formatCurrency((estimate.markup / 100) * estimate.subtotal)})</span>
                    </div>
                  `
                      : ''
                  }
                  ${
                    estimate.discount
                      ? `
                    <div class="total-row">
                      <span class="total-label">Discount:</span>
                      <span class="total-value">-${formatCurrency(estimate.discount)}</span>
                    </div>
                  `
                      : ''
                  }
                  ${
                    estimate.tax
                      ? `
                    <div class="total-row">
                      <span class="total-label">Tax:</span>
                      <span class="total-value">${estimate.tax}% (${formatCurrency((estimate.tax / 100) * estimate.subtotal)})</span>
                    </div>
                  `
                      : ''
                  }
                  <div class="total-row grand-total">
                    <span class="total-label">Total:</span>
                    <span class="total-value">${formatCurrency(estimate.total)}</span>
                  </div>
                </div>
              </div>

              ${
                estimate.notes
                  ? `
                <div class="section">
                  <h3>Notes</h3>
                  <p>${estimate.notes}</p>
                </div>
              `
                  : ''
              }

              <div class="section" style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/estimates/${estimate.id}" class="button">
                  View Estimate Online
                </a>
              </div>

              <div class="footer">
                <p>This estimate was sent by ${estimate.organization.name}</p>
                <p>If you have any questions, please contact us at ${estimate.organization.email || 'noreply@servicegeek.io'}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: 'Service Geek <noreply@servicegeek.io>',
        to,
        subject: `Estimate #${estimate.number} from ${estimate.organization.name}`,
        html,
      });
    } catch (error) {
      console.error('Failed to send estimate email:', error);
      throw new Error('Failed to send estimate email');
    }
  }
}
