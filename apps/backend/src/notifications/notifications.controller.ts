import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

interface UpdatePushTokenDto {
  expoPushToken: string;
}

interface RemovePushTokenDto {
  expoPushToken: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('push-token')
  @HttpCode(HttpStatus.OK)
  async updatePushToken(
    @Request() req: any,
    @Body() updatePushTokenDto: UpdatePushTokenDto,
  ) {
    const userId = req.user.sub;
    await this.notificationsService.updateUserPushToken(
      userId,
      updatePushTokenDto.expoPushToken,
    );
    return { success: true, message: 'Push token updated successfully' };
  }

  @Post('push-token/remove')
  @HttpCode(HttpStatus.OK)
  async removePushToken(
    @Request() req: any,
    @Body() removePushTokenDto: RemovePushTokenDto,
  ) {
    const userId = req.user.sub;
    await this.notificationsService.removeUserPushToken(userId);
    return { success: true, message: 'Push token removed successfully' };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestNotification(@Request() req: any) {
    const userId = req.user.sub;

    // Get user's push token
    const user = await this.notificationsService.getUserPushToken(userId);

    if (!user?.expoPushToken) {
      return { success: false, message: 'No push token found for user' };
    }

    // Send test notification
    await this.notificationsService.sendPushNotification(
      [
        {
          userId,
          expoPushToken: user.expoPushToken,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      ],
      {
        title: 'Test Notification',
        body: 'This is a test push notification from ServiceGeek!',
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
        sound: 'default',
        channelId: 'chat-messages',
      },
    );

    return { success: true, message: 'Test notification sent successfully' };
  }

  @Get()
  async getUserNotifications(
    @Request() req: any,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    const userId = req.user.sub;
    const notifications = await this.notificationsService.getUserNotifications(
      userId,
      parseInt(limit),
      parseInt(offset),
    );
    return { success: true, notifications };
  }

  @Get('unseen-count')
  async getUnseenNotificationCount(@Request() req: any) {
    const userId = req.user.sub;
    const count =
      await this.notificationsService.getUnseenNotificationCount(userId);
    return { success: true, count };
  }

  @Patch(':id/seen')
  @HttpCode(HttpStatus.OK)
  async markNotificationAsSeen(
    @Request() req: any,
    @Param('id') notificationId: string,
  ) {
    const userId = req.user.sub;
    await this.notificationsService.markNotificationAsSeen(
      notificationId,
      userId,
    );
    return { success: true, message: 'Notification marked as seen' };
  }

  @Patch('mark-all-seen')
  @HttpCode(HttpStatus.OK)
  async markAllNotificationsAsSeen(@Request() req: any) {
    const userId = req.user.sub;
    await this.notificationsService.markAllNotificationsAsSeen(userId);
    return { success: true, message: 'All notifications marked as seen' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Request() req: any,
    @Param('id') notificationId: string,
  ) {
    const userId = req.user.sub;
    await this.notificationsService.deleteNotification(notificationId, userId);
    return { success: true, message: 'Notification deleted' };
  }
}
