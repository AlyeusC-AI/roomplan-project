import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  rate: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  estimateId?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isSaved?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;
}

export class UpdateInvoiceItemDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  rate?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;
}

export class SaveInvoiceItemDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  rate: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty()
  @IsUUID()
  organizationId: string;
}
