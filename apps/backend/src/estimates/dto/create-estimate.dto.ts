import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEstimateItemDto {
  @ApiProperty({ description: 'Description of the item' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantity of the item' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Rate per unit' })
  @IsNumber()
  rate: number;

  @ApiProperty({ description: 'Total amount for this item' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Optional notes for the item', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateEstimateDto {
  @ApiProperty({ description: 'Estimate number' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Client name' })
  @IsString()
  clientName: string;

  @ApiProperty({ description: 'Client email', required: false })
  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @ApiProperty({ description: 'Project ID', required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ description: 'Purchase order number', required: false })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiProperty({ description: 'Estimate date' })
  @IsDate()
  @Type(() => Date)
  estimateDate: Date;

  @ApiProperty({ description: 'Expiry date' })
  @IsDate()
  @Type(() => Date)
  expiryDate: Date;

  @ApiProperty({ description: 'Terms', required: false })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ description: 'Subtotal amount' })
  @IsNumber()
  subtotal: number;

  @ApiProperty({ description: 'Markup percentage', required: false })
  @IsOptional()
  @IsNumber()
  markup?: number;

  @ApiProperty({ description: 'Discount amount', required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ description: 'Tax amount', required: false })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiProperty({ description: 'Total amount' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Deposit amount', required: false })
  @IsOptional()
  @IsNumber()
  deposit?: number;

  @ApiProperty({
    description: 'Estimate status',
    enum: ['DRAFT', 'SENT', 'APPROVED', 'REJECTED'],
  })
  @IsEnum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED'])
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Estimate items', type: [CreateEstimateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEstimateItemDto)
  items: CreateEstimateItemDto[];
}
