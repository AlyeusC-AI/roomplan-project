import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Organization phone number', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Organization address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Organization fax number', required: false })
  @IsString()
  @IsOptional()
  faxNumber?: string;

  @ApiProperty({ description: 'Organization size', required: false })
  @IsNumber()
  @IsOptional()
  size?: number;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @ApiProperty({ description: 'Organization logo URL', required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ description: 'Organization latitude', required: false })
  @IsLatitude()
  @IsOptional()
  lat?: number;

  @ApiProperty({ description: 'Organization longitude', required: false })
  @IsLongitude()
  @IsOptional()
  lng?: number;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsString()
  @IsOptional()
  subscriptionPlan?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsNumber()
  @IsOptional()
  maxUsersForSubscription?: number;

  @IsString()
  @IsOptional()
  freeTrialEndsAt?: string;

  @IsString()
  @IsOptional()
  subscriptionStatus?: string;
}
