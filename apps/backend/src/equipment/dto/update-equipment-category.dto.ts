import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateEquipmentCategoryDto {
  @ApiPropertyOptional({ description: 'Name of the equipment category' })
  @IsString()
  @IsOptional()
  name?: string;
}
