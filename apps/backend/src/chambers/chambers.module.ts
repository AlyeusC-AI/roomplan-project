import { Module } from '@nestjs/common';
import { ChambersService } from './chambers.service';
import { ChambersController } from './chambers.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChambersController],
  providers: [ChambersService, PrismaService],
  exports: [ChambersService],
})
export class ChambersModule {}
