import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateMaterialDto {
  @ApiPropertyOptional({ description: 'Name of the material' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the material' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL of the material' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description:
      'Variance percentage (0-100). For dry standard, should be ≤ 15%',
    minimum: 0,
    maximum: 100,
    example: 12.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  variance?: number;
}
