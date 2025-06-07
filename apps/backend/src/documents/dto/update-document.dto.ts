import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UpdateDocumentDto {
  @ApiProperty({ description: 'Name of the document', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Type of the document',
    enum: DocumentType,
    required: false,
  })
  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @ApiProperty({ description: 'JSON data of the document', required: false })
  @IsObject()
  @IsOptional()
  json?: any;
}
