import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { LossType } from '@prisma/client';

export class UpdateFormDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: LossType, isArray: true, required: false })
  @IsEnum(LossType, { each: true })
  @IsOptional()
  lossTypes?: LossType[];
}
