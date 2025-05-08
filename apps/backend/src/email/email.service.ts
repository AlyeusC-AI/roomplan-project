import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

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
}
