import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EquipmentCategoryService } from './equipment-category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateEquipmentCategoryDto } from './dto/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from './dto/update-equipment-category.dto';

@ApiTags('equipment-categories')
@ApiBearerAuth()
@Controller('equipment-categories')
@UseGuards(JwtAuthGuard)
export class EquipmentCategoryController {
  constructor(private readonly categoryService: EquipmentCategoryService) {}

  @Post()
  async create(@Body() data: CreateEquipmentCategoryDto) {
    return this.categoryService.create(data);
  }

  @Get('organization/:organizationId')
  async findAll(@Param('organizationId') organizationId: string) {
    return this.categoryService.findAll(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateEquipmentCategoryDto,
  ) {
    return this.categoryService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
