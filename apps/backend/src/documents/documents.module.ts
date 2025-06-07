import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { EmailModule } from '../email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [EmailModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
