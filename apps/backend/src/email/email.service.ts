import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOrganizationInvitation(
    to: string,
    organizationName: string,
    inviterName: string,
    invitationLink: string,
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Service Geek <noreply@servicegeek.com>',
        to: [to],
        subject: `You've been invited to join ${organizationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Organization Invitation</h2>
            <p>Hello,</p>
            <p>${inviterName} has invited you to join their organization "${organizationName}" on Service Geek.</p>
            <p>Click the button below to accept the invitation:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Accept Invitation
              </a>
            </div>
            <p>If you don't want to join, you can simply ignore this email.</p>
            <p>Best regards,<br>The Service Geek Team</p>
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
        from: 'Service Geek <noreply@servicegeek.com>',
        to: [to],
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for signing up with Service Geek. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Verify Email
              </a>
            </div>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The Service Geek Team</p>
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
        from: 'Service Geek <noreply@servicegeek.com>',
        to: [to],
        subject: 'Reset your password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The Service Geek Team</p>
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
        from: 'Service Geek <noreply@servicegeek.com>',
        to: [to],
        subject: 'Welcome to Service Geek!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Service Geek!</h2>
            <p>Hello ${firstName},</p>
            <p>Thank you for joining Service Geek! We're excited to have you on board.</p>
            <p>Here are a few things you can do to get started:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Create or join an organization</li>
              <li>Explore our features</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Service Geek Team</p>
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
