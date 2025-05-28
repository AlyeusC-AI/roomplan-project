import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [FormsController],
  providers: [FormsService, PrismaService],
  exports: [FormsService],
})
export class FormsModule {}
