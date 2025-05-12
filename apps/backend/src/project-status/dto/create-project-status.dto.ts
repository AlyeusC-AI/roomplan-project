import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateProjectStatusDto {
  @ApiProperty({ description: 'The label of the project status' })
  @IsString()
  label: string;

  @ApiProperty({
    description: 'The description of the project status',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The color of the project status',
    required: false,
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Whether this is a default status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({
    description: 'The order of the project status',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ description: 'The organization ID this status belongs to' })
  @IsUUID()
  organizationId: string;
}
