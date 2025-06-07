import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateEquipmentDto {
  @ApiProperty({ description: 'Name of the equipment' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the equipment', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Quantity of the equipment' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Image URL of the equipment', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;
}
