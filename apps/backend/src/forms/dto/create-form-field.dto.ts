import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { FormFieldType } from '@prisma/client';

export class CreateFormFieldDto {
  @ApiProperty({
    description: 'The name of the field',
    example: 'First Name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The type of the field',
    enum: FormFieldType,
    example: FormFieldType.TEXT,
  })
  @IsEnum(FormFieldType)
  type: FormFieldType;

  @ApiProperty({
    description: 'The options for select, radio, or checkbox fields',
    example: ['Option 1', 'Option 2'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiProperty({
    description: 'The order of the field in the form or section',
    example: 1,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: 'Whether the field is required',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({
    description: 'The ID of the section this field belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  formSectionId?: string;
}
