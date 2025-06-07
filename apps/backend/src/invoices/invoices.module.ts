import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { ImageKitService } from 'src/imagekit/imagekit.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService, EmailService, ImageKitService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
