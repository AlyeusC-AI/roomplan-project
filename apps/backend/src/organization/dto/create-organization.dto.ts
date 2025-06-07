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

  @ApiProperty({
    description: 'Organization formatted address',
    required: false,
  })
  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ApiProperty({ description: 'Organization city', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ description: 'Organization region', required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ description: 'Organization postal code', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ description: 'Organization country', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Organization fax number', required: false })
  @IsString()
  @IsOptional()
  faxNumber?: string;

  @ApiProperty({ description: 'Organization size', required: false })
  @IsNumber()
  @IsOptional()
  size?: number;

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
}
