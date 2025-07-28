import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { SpaceController } from '../space/space.controller';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    PrismaService,
    PdfGeneratorService,
    SpaceController,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
