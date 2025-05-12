import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CalendarEvent,
  Role,
  MemberStatus,
  ReminderTarget,
} from '@prisma/client';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { subDays, formatDistanceToNow } from 'date-fns';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CalendarEventsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private calculateReminderDate(start: Date, reminderTime: string): Date {
    const reminderDate = new Date(start);
    switch (reminderTime) {
      case '24h':
        reminderDate.setHours(reminderDate.getHours() - 24);
        break;
      case '2h':
        reminderDate.setHours(reminderDate.getHours() - 2);
        break;
      case '40m':
        reminderDate.setMinutes(reminderDate.getMinutes() - 40);
        break;
    }
    return reminderDate;
  }

  async create(
    createCalendarEventDto: CreateCalendarEventDto,
    userId: string,
  ): Promise<CalendarEvent> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: createCalendarEventDto.organizationId,
        userId: userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to create calendar events in this organization',
      );
    }

    const calendarEvent = await this.prisma.calendarEvent.create({
      data: {
        ...createCalendarEventDto,
        usersToRemind: {
          connect: createCalendarEventDto.users.map((id) => ({ id })),
        },
      },
      include: {
        usersToRemind: true,
        reminders: true,
      },
    });

    // Create reminders if needed
    if (createCalendarEventDto.reminderTime) {
      const reminderDate = this.calculateReminderDate(
        createCalendarEventDto.start,
        createCalendarEventDto.reminderTime,
      );

      const reminders: {
        date: Date;
        reminderTarget: ReminderTarget;
        sendEmail: boolean;
        sendText: boolean;
        calendarEventId: string;
        userId?: string;
      }[] = [];

      if (createCalendarEventDto.remindClient) {
        reminders.push({
          date: reminderDate,
          reminderTarget: ReminderTarget.CLIENT,
          sendEmail: true,
          sendText: true,
          calendarEventId: calendarEvent.id,
        });
      }

      if (createCalendarEventDto.remindProjectOwners) {
        reminders.push({
          date: reminderDate,
          reminderTarget: ReminderTarget.PROJECT_CREATOR,
          sendEmail: true,
          sendText: true,
          calendarEventId: calendarEvent.id,
        });
      }

      if (createCalendarEventDto.users.length > 0) {
        reminders.push(
          ...createCalendarEventDto.users.map((userId) => ({
            date: reminderDate,
            reminderTarget: ReminderTarget.USERS,
            sendEmail: true,
            sendText: true,
            calendarEventId: calendarEvent.id,
            userId,
          })),
        );
      }

      if (reminders.length > 0) {
        await this.prisma.calendarEventReminder.createMany({
          data: reminders,
        });
      }
    }

    return calendarEvent;
  }

  async findAll(
    organizationId: string,
    userId: string,
    projectId?: string,
  ): Promise<CalendarEvent[]> {
    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view calendar events in this organization',
      );
    }

    return this.prisma.calendarEvent.findMany({
      where: {
        organizationId,
        projectId: projectId || undefined,
        isDeleted: false,
      },
      include: {
        usersToRemind: true,
        reminders: true,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<CalendarEvent> {
    const calendarEvent = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        usersToRemind: true,
        reminders: true,
      },
    });

    if (!calendarEvent) {
      throw new NotFoundException('Calendar event not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: calendarEvent.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to view this calendar event',
      );
    }

    return calendarEvent;
  }

  async update(
    id: string,
    updateCalendarEventDto: UpdateCalendarEventDto,
    userId: string,
  ): Promise<CalendarEvent> {
    const calendarEvent = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        usersToRemind: true,
        reminders: true,
      },
    });

    if (!calendarEvent) {
      throw new NotFoundException('Calendar event not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: calendarEvent.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to update calendar events in this organization',
      );
    }

    // Delete existing reminders
    await this.prisma.calendarEventReminder.deleteMany({
      where: { calendarEventId: id },
    });

    const updatedEvent = await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...updateCalendarEventDto,
        usersToRemind: updateCalendarEventDto.users
          ? {
              set: updateCalendarEventDto.users.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        usersToRemind: true,
        reminders: true,
      },
    });

    // Create new reminders if needed
    if (updateCalendarEventDto.reminderTime && updateCalendarEventDto.start) {
      const reminderDate = this.calculateReminderDate(
        updateCalendarEventDto.start,
        updateCalendarEventDto.reminderTime,
      );

      const reminders: {
        date: Date;
        reminderTarget: ReminderTarget;
        sendEmail: boolean;
        sendText: boolean;
        calendarEventId: string;
        userId?: string;
      }[] = [];

      if (updateCalendarEventDto.remindClient) {
        reminders.push({
          date: reminderDate,
          reminderTarget: ReminderTarget.CLIENT,
          sendEmail: true,
          sendText: true,
          calendarEventId: id,
        });
      }

      if (updateCalendarEventDto.remindProjectOwners) {
        reminders.push({
          date: reminderDate,
          reminderTarget: ReminderTarget.PROJECT_CREATOR,
          sendEmail: true,
          sendText: true,
          calendarEventId: id,
        });
      }

      if (
        updateCalendarEventDto.users &&
        updateCalendarEventDto.users.length > 0
      ) {
        reminders.push(
          ...updateCalendarEventDto.users.map((userId) => ({
            date: reminderDate,
            reminderTarget: ReminderTarget.USERS,
            sendEmail: true,
            sendText: true,
            calendarEventId: id,
            userId,
          })),
        );
      }

      if (reminders.length > 0) {
        await this.prisma.calendarEventReminder.createMany({
          data: reminders,
        });
      }
    }

    return updatedEvent;
  }

  async remove(id: string, userId: string): Promise<CalendarEvent> {
    const calendarEvent = await this.prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!calendarEvent) {
      throw new NotFoundException('Calendar event not found');
    }

    // Check if user is a member of the organization
    const member = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: calendarEvent.organizationId,
        userId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new BadRequestException(
        'You do not have permission to delete calendar events in this organization',
      );
    }

    // Delete all reminders
    await this.prisma.calendarEventReminder.deleteMany({
      where: { calendarEventId: id },
    });

    // Soft delete the calendar event
    return this.prisma.calendarEvent.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async sendReminders() {
    try {
      // Get current date and time
      const now = new Date();
      const currentDateTime = now.toISOString();

      // Fetch reminders that are due and not sent yet
      const reminders = await this.prisma.calendarEventReminder.findMany({
        where: {
          date: {
            lte: currentDateTime,
            gte: subDays(new Date(), 1).toISOString(),
          },
          OR: [{ textSentAt: null }, { emailSentAt: null }],
        },
        include: {
          user: {
            select: {
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
          calendarEvent: {
            include: {
              organization: {
                select: {
                  phoneNumber: true,
                  name: true,
                },
              },
              project: {
                select: {
                  adjusterEmail: true,
                  adjusterPhoneNumber: true,
                  clientEmail: true,
                  clientPhoneNumber: true,
                  clientName: true,
                  adjusterName: true,
                  name: true,
                  location: true,
                },
              },
            },
          },
        },
      });

      // Process each reminder
      for (const reminder of reminders) {
        const updates: Record<string, any> = {};
        const project = reminder.calendarEvent?.project;
        const organization = reminder.calendarEvent?.organization;

        // Determine recipient details based on reminderTarget
        let recipientEmail = '';
        let recipientPhone = '';
        let recipientName = '';

        if (reminder.reminderTarget === 'CLIENT' && project) {
          recipientEmail = project.clientEmail || '';
          recipientPhone = project.clientPhoneNumber || '';
          recipientName = project.clientName || '';
        } else if (reminder.reminderTarget === 'PROJECT_CREATOR' && project) {
          recipientEmail = project.adjusterEmail || '';
          recipientPhone = project.adjusterPhoneNumber || '';
          recipientName = project.adjusterName || '';
        } else if (reminder.reminderTarget === 'USERS' && reminder.user) {
          recipientEmail = reminder.user?.email || '';
          recipientPhone = reminder.user?.phone || '';
          recipientName =
            reminder.user?.firstName + ' ' + reminder.user?.lastName;
        }

        // Send SMS if configured and not sent yet
        if (reminder.sendText && !reminder.textSentAt && recipientPhone) {
          try {
            const message = `Hi ${recipientName},\n\nThis is a reminder for your upcoming appointment:\n${
              reminder.calendarEvent?.subject || 'Calendar Event'
            }\n${reminder.calendarEvent?.description || ''} ${
              project?.location ? `\n\nLocation: ${project.location}` : ''
            }\n\nTime: ${reminder.calendarEvent?.start ? formatDistanceToNow(new Date(reminder.calendarEvent.start), { addSuffix: true }) : 'Time not specified'}\n\nBest regards,\n${
              organization?.name || 'RestoreGeek Team'
            }`;

            const TWILIO_ACCOUNT_SID =
              this.configService.get('TWILIO_ACCOUNT_SID');
            const TWILIO_AUTH_TOKEN =
              this.configService.get('TWILIO_AUTH_TOKEN');
            const TWILIO_PHONE_NUMBER = this.configService.get(
              'TWILIO_PHONE_NUMBER',
            );

            if (
              !TWILIO_ACCOUNT_SID ||
              !TWILIO_AUTH_TOKEN ||
              !TWILIO_PHONE_NUMBER
            ) {
              throw new Error('Twilio credentials not configured');
            }

            const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

            const formData = new URLSearchParams();
            formData.append('To', recipientPhone);
            formData.append('From', TWILIO_PHONE_NUMBER);
            formData.append('Body', message);

            const response = await fetch(url, {
              method: 'POST',
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
                ).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: formData.toString(),
            });

            if (response.ok) {
              updates.textSentAt = currentDateTime;
              console.log(`SMS sent to ${recipientName} at ${recipientPhone}`);
            } else {
              const errorData = await response.json();
              console.error('Failed to send SMS:', errorData);
            }
          } catch (error) {
            console.error('Failed to send SMS:', error);
          }
        }

        // Send Email if configured and not sent yet
        // if (reminder.sendEmail && !reminder.emailSentAt && recipientEmail) {
        //   try {
        //     const RESEND_API_KEY = this.configService.get('RESEND_API_KEY');
        //     if (!RESEND_API_KEY) {
        //       throw new Error('Resend API key not configured');
        //     }

        //     const emailResponse = await fetch('https://api.resend.com/emails', {
        //       method: 'POST',
        //       headers: {
        //         Authorization: `Bearer ${RESEND_API_KEY}`,
        //         'Content-Type': 'application/json',
        //       },
        //       body: JSON.stringify({
        //         to: recipientEmail,
        //         from: 'RestoreGeek <team@servicegeek.io>',
        //         subject: `Reminder: ${reminder.calendarEvent?.subject || 'Calendar Event'}`,
        //         html: `
        //           <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
        //             <h1 style="color: #4CAF50;">Calendar Event Reminder</h1>
        //             <p style="font-size: 16px;">Hi ${recipientName},</p>
        //             <h2>${reminder.calendarEvent?.subject || 'Calendar Event'}</h2>
        //             <p style="font-size: 16px;">${
        //               reminder.calendarEvent?.description || ''
        //             }</p>
        //             <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 20px 0;">
        //               <h3 style="color: #333; margin-top: 0;">Project Details</h3>
        //               <p style="margin: 5px 0;"><strong>Project Name:</strong> ${
        //                 project?.name || ''
        //               }</p>
        //             </div>
        //             <footer style="margin-top: 20px; font-size: 12px; color: #777;">
        //               <p>Best regards,<br>${organization?.name || 'RestoreGeek Team'}</p>
        //               <p><a href="https://restoregeek.app" style="color: #4CAF50;">Visit our website</a></p>
        //             </footer>
        //           </div>
        //         `,
        //       }),
        //     });

        //     if (emailResponse.ok) {
        //       updates.emailSentAt = currentDateTime;
        //       console.log(
        //         `Email sent to ${recipientName} at ${recipientEmail}`,
        //       );
        //     } else {
        //       const errorResponse = await emailResponse.json();
        //       console.error('Failed to send email:', errorResponse);
        //     }
        //   } catch (error) {
        //     console.error('Failed to send email:', error);
        //   }
        // }

        // Update the reminder if any notifications were sent
        if (Object.keys(updates).length > 0) {
          await this.prisma.calendarEventReminder.update({
            where: { id: reminder.id },
            data: {
              ...updates,
              updatedAt: currentDateTime,
            },
          });
        }
      }

      return { message: 'Reminders processed successfully!' };
    } catch (error) {
      console.error('Error processing reminders:', error);
      throw new Error('Failed to process reminders');
    }
  }
}
