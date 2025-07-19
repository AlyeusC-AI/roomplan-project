import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateProjectMaterialDto {
  @ApiPropertyOptional({
    description: 'Custom variance override for this project (0-100)',
    minimum: 0,
    maximum: 100,
    example: 12.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  customVariance?: number;

  @ApiPropertyOptional({
    description: 'Initial moisture content (%)',
    minimum: 0,
    maximum: 100,
    example: 25.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  initialMoisture?: number;

  @ApiPropertyOptional({
    description: 'Current moisture content (%)',
    minimum: 0,
    maximum: 100,
    example: 18.2,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  currentMoisture?: number;

  @ApiPropertyOptional({
    description: 'Target dry goal (%)',
    minimum: 0,
    maximum: 100,
    example: 12.0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  dryGoal?: number;
}
