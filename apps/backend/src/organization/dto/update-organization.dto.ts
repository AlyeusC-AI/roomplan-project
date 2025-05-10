import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ description: 'Organization name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Organization phone number', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

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
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ description: 'Organization longitude', required: false })
  @IsNumber()
  @IsOptional()
  lng?: number;
}
