import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { EquipmentCategoryController } from './equipment-category.controller';
import { EquipmentCategoryService } from './equipment-category.service';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  controllers: [EquipmentController, EquipmentCategoryController],
  providers: [EquipmentService, EquipmentCategoryService, PrismaService],
  exports: [EquipmentService, EquipmentCategoryService],
})
export class EquipmentModule {}
