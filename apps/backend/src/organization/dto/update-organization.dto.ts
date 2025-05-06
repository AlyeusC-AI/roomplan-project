import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ description: 'Organization name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

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
