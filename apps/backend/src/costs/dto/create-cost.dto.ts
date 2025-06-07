import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { CostType } from '@prisma/client';

export class CreateCostDto {
  @ApiProperty({ description: 'Name of the cost' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Estimated cost amount', required: false })
  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

  @ApiProperty({ description: 'Actual cost amount', required: false })
  @IsNumber()
  @IsOptional()
  actualCost?: number;

  @ApiProperty({ description: 'Type of cost', enum: CostType })
  @IsEnum(CostType)
  type: CostType;

  @ApiProperty({ description: 'Project ID' })
  @IsString()
  projectId: string;
}
