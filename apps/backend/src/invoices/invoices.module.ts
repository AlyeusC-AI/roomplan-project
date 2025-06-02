import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService, EmailService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
