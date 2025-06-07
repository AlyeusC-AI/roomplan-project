import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { LossType } from '@prisma/client';

export class CreateFormDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: LossType, isArray: true, required: false })
  @IsEnum(LossType, { each: true })
  @IsOptional()
  lossTypes?: LossType[];

  @ApiProperty()
  @IsUUID()
  organizationId: string;
}
