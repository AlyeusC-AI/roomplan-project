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
import { ProjectsModule } from './projects/projects.module';
import { RoomsModule } from './rooms/rooms.module';
import { NotesModule } from './notes/notes.module';
import { ReadingsModule } from './readings/readings.module';
import { DocumentsModule } from './documents/documents.module';
import { FormsModule } from './forms/forms.module';
import { CostsModule } from './costs/costs.module';
import { InvoicesModule } from './invoices/invoices.module';
import { EstimatesModule } from './estimates/estimates.module';
import { SpaceModule } from './space/space.module';
import { TagsModule } from './tags/tags.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChambersModule } from './chambers/chambers.module';
import { MaterialsModule } from './materials/materials.module';
import { ReportsModule } from './reports/reports.module';

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
    ProjectsModule,
    RoomsModule,
    NotesModule,
    ReadingsModule,
    DocumentsModule,
    FormsModule,
    CostsModule,
    InvoicesModule,
    EstimatesModule,
    SpaceModule,
    TagsModule,
    ChatModule,
    NotificationsModule,
    ChambersModule,
    MaterialsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
