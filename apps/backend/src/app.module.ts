import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { OrganizationModule } from './organization/organization.module';
import { EmailModule } from './email/email.module';
import { BillingModule } from './billing/billing.module';
import { ImageKitModule } from './imagekit/imagekit.module';
import { ProjectStatusModule } from './project-status/project-status.module';
import { EquipmentModule } from './equipment/equipment.module';
import { CronModule } from './cron/cron.module';
import { CalendarEventsModule } from './calendar-events/calendar-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    OrganizationModule,
    EmailModule,
    BillingModule,
    ImageKitModule,
    ProjectStatusModule,
    EquipmentModule,
    CalendarEventsModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
