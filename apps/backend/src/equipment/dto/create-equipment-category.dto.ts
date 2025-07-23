import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEquipmentCategoryDto {
  @ApiProperty({ description: 'Name of the equipment category' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  organizationId: string;
}
