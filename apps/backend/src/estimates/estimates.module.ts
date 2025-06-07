import { Module } from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { EstimatesController } from './estimates.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { InvoicesService } from '../invoices/invoices.service';
import { ImageKitService } from 'src/imagekit/imagekit.service';

@Module({
  controllers: [EstimatesController],
  providers: [
    EstimatesService,
    PrismaService,
    EmailService,
    InvoicesService,
    ImageKitService,
  ],
  exports: [EstimatesService],
})
export class EstimatesModule {}
