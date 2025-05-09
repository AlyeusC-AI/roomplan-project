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
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
