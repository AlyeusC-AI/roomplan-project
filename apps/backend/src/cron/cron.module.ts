import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { CalendarEventsModule } from '../calendar-events/calendar-events.module';
import { CalendarEventsService } from 'src/calendar-events/calendar-events.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, CalendarEventsModule],
  providers: [CalendarEventsService],
  exports: [CalendarEventsService],
})
export class CronModule {}
