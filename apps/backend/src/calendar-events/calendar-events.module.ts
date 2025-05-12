import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventsController } from './calendar-events.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CalendarEventsController],
  providers: [CalendarEventsService, PrismaService],
  exports: [CalendarEventsService],
})
export class CalendarEventsModule {}
