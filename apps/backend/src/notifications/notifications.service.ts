import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  channelId?: string;
}

export interface NotificationRecipient {
  userId: string;
  expoPushToken?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly expo = new Expo();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async sendPushNotification(
    recipients: NotificationRecipient[],
    payload: PushNotificationPayload,
  ) {
    const validRecipients = recipients.filter(
      (recipient) => recipient.expoPushToken,
    );

    if (validRecipients.length === 0) {
      this.logger.warn('No valid push tokens found for notification');
      return;
    }

    // Create messages for Expo SDK
    const messages: ExpoPushMessage[] = validRecipients.map((recipient) => ({
      to: recipient.expoPushToken!,
      sound: payload.sound || 'default',
      title: payload.title,
      body: payload.body,
      data: {
        ...payload.data,
        recipientId: recipient.userId,
      },
      badge: payload.badge,
      channelId: payload.channelId,
    }));

    // Validate push tokens
    const validMessages = messages.filter((message) =>
      Expo.isExpoPushToken(message.to),
    );

    if (validMessages.length === 0) {
      this.logger.warn('No valid Expo push tokens found');
      return;
    }

    try {
      // Send notifications in chunks (Expo recommends max 100 per request)
      const chunks = this.expo.chunkPushNotifications(validMessages);
      const tickets: any[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          this.logger.error(
            `Error sending notification chunk: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `Push notification tickets created for ${tickets.length} recipients`,
      );

      // Check for errors in tickets
      const errorTickets = tickets.filter(
        (ticket) => ticket.status === 'error',
      );
      if (errorTickets.length > 0) {
        errorTickets.forEach((ticket) => {
          this.logger.error(`Push notification error: ${ticket.message}`);
        });
      }

      return tickets;
    } catch (error) {
      this.logger.error(`Error sending push notification: ${error.message}`);
      throw error;
    }
  }

  async sendChatMessageNotification(
    chatId: string,
    senderId: string,
    messageContent: string,
    messageType: string,
  ) {
    try {
      // Get chat participants (excluding sender)
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  expoPushToken: true,
                },
              },
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              clientName: true,
            },
          },
        },
      });

      if (!chat) {
        this.logger.warn(`Chat not found: ${chatId}`);
        return;
      }

      // Get sender info
      const sender = await this.prisma.user.findUnique({
        where: { id: senderId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (!sender) {
        this.logger.warn(`Sender not found: ${senderId}`);
        return;
      }

      // Filter out sender from recipients and handle null tokens
      const recipients = chat.participants
        .filter((participant) => participant.user.id !== senderId)
        .map((participant) => ({
          userId: participant.user.id,
          expoPushToken: participant.user.expoPushToken || undefined,
          firstName: participant.user.firstName,
          lastName: participant.user.lastName,
          email: participant.user.email,
        }));

      if (recipients.length === 0) {
        this.logger.log('No recipients found for chat notification');
        return;
      }

      // Create notification title and body
      let title: string;
      let body: string;

      if (chat.type === 'PROJECT' && chat.project) {
        title = `${chat.project.name}`;
        body = `${sender.firstName} ${sender.lastName}: ${this.truncateMessage(messageContent, messageType)}`;
      } else if (chat.type === 'PRIVATE') {
        title = `${sender.firstName} ${sender.lastName}`;
        body = this.truncateMessage(messageContent, messageType);
      } else {
        title = chat.name || 'Group Chat';
        body = `${sender.firstName} ${sender.lastName}: ${this.truncateMessage(messageContent, messageType)}`;
      }

      // Send push notification
      await this.sendPushNotification(recipients, {
        title,
        body,
        data: {
          type: 'chat_message',
          chatId,
          messageType,
          senderId,
          projectId: chat.project?.id,
        },
        sound: 'default',
        channelId: 'chat-messages',
      });

      // Save notification to database
      await this.saveNotificationToDatabase(recipients, {
        title,
        content: body,
        type: 'CHAT_MESSAGE',
        link: `/chats/${chatId}`,
        linkText: 'View Chat',
        data: {
          chatId,
          messageType,
          senderId,
          projectId: chat.project?.id,
        },
      });
    } catch (error) {
      this.logger.error(`Error sending chat notification: ${error.message}`);
    }
  }

  private truncateMessage(content: string, type: string): string {
    if (type === 'IMAGE') {
      return '📷 Image';
    } else if (type === 'FILE') {
      return '📎 File';
    } else if (type === 'AUDIO') {
      return '🎵 Voice message';
    } else {
      // Truncate text messages
      return content.length > 50 ? `${content.substring(0, 50)}...` : content;
    }
  }

  private async saveNotificationToDatabase(
    recipients: NotificationRecipient[],
    notification: {
      title: string;
      content: string;
      type: string;
      link?: string;
      linkText?: string;
      data?: Record<string, any>;
    },
  ) {
    try {
      const notifications = recipients.map((recipient) => ({
        userId: recipient.userId,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        link: notification.link,
        linkText: notification.linkText,
        publicId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isSeen: false,
        isDeleted: false,
        data: notification.data,
      }));

      await this.prisma.notification.createMany({
        data: notifications,
      });
    } catch (error) {
      this.logger.error(
        `Error saving notification to database: ${error.message}`,
      );
    }
  }

  async updateUserPushToken(userId: string, expoPushToken: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { expoPushToken },
      });
      this.logger.log(`Updated push token for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error updating push token: ${error.message}`);
      throw error;
    }
  }

  async removeUserPushToken(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { expoPushToken: null },
      });
      this.logger.log(`Removed push token for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error removing push token: ${error.message}`);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          userId,
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return notifications;
    } catch (error) {
      this.logger.error(`Error fetching user notifications: ${error.message}`);
      throw error;
    }
  }

  async markNotificationAsSeen(notificationId: string, userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isSeen: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error marking notification as seen: ${error.message}`);
      throw error;
    }
  }

  async markAllNotificationsAsSeen(userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userId,
          isSeen: false,
          isDeleted: false,
        },
        data: {
          isSeen: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error marking all notifications as seen: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteNotification(notificationId: string, userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isDeleted: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error deleting notification: ${error.message}`);
      throw error;
    }
  }

  async getUnseenNotificationCount(userId: string) {
    try {
      const count = await this.prisma.notification.count({
        where: {
          userId,
          isSeen: false,
          isDeleted: false,
        },
      });

      return count;
    } catch (error) {
      this.logger.error(
        `Error getting unseen notification count: ${error.message}`,
      );
      throw error;
    }
  }

  async getUserPushToken(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          expoPushToken: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(`Error getting user push token: ${error.message}`);
      throw error;
    }
  }
}
