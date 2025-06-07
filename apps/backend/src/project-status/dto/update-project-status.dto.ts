import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'The label of the project status',
    required: false,
  })
  @IsString()
  @IsOptional()
  label?: string;

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
}
