import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ description: 'Name of the material' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the material' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL of the material' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description:
      'Variance percentage (0-100). For dry standard, should be ≤ 15%',
    minimum: 0,
    maximum: 100,
    example: 12.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  variance: number;
}
