import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarEventsService } from '../calendar-events/calendar-events.service';

@Injectable()
export class RemindersCronService {
  private readonly logger = new Logger(RemindersCronService.name);

  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleReminders() {
    try {
      this.logger.log('Starting to process reminders...');
      await this.calendarEventsService.sendReminders();
      this.logger.log('Finished processing reminders');
    } catch (error) {
      this.logger.error('Failed to process reminders:', error);
    }
  }
}
