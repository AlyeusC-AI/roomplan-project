import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
} from 'class-validator';
import { LossType } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  adjusterEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  adjusterPhoneNumber?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientPhoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  adjusterName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  managerName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  insuranceCompanyName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  insuranceClaimId?: string;

  @ApiPropertyOptional()
  @IsEnum(LossType)
  @IsOptional()
  lossType?: LossType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  catCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  humidity?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  temperature?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wind?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lat?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lng?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  forecast?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  claimSummary?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roofSegments?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roofSpecs?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rcvValue?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  actualValue?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  statusId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mainImage?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  policyNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateOfLoss?: string;

  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignmentNumber?: string;
}
