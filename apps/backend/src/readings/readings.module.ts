import { Module } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ReadingsController],
  providers: [ReadingsService, PrismaService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
