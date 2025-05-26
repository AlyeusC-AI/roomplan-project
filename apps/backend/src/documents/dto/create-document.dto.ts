import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Name of the document', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Type of the document', enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ description: 'JSON data of the document', required: false })
  @IsObject()
  @IsOptional()
  json?: any;

  @ApiProperty({ description: 'ID of the project this document belongs to' })
  @IsString()
  projectId: string;
}
