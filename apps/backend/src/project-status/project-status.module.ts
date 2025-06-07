import { Module } from '@nestjs/common';
import { ProjectStatusService } from './project-status.service';
import { ProjectStatusController } from './project-status.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectStatusController],
  providers: [ProjectStatusService, PrismaService],
  exports: [ProjectStatusService],
})
export class ProjectStatusModule {}
