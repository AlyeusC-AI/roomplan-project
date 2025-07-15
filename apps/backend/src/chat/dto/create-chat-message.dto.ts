import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export class ChatMessageAttachmentDto {
  @ApiProperty({
    description: 'File name',
    example: 'document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://example.com/files/document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024,
    required: false,
  })
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
    required: false,
  })
  @IsOptional()
  mimeType?: string;

  @ApiProperty({
    description: 'Thumbnail URL for images',
    example: 'https://example.com/thumbnails/document.jpg',
    required: false,
  })
  @IsOptional()
  thumbnailUrl?: string;
}

export class CreateChatMessageDto {
  @ApiProperty({
    description: 'The content of the chat message',
    example: 'Hello team! How is the project going?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({
    description: 'Type of message',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @ApiProperty({
    description: 'ID of the message this is replying to',
    required: false,
  })
  @IsString()
  @IsOptional()
  replyToId?: string;

  @ApiProperty({
    description: 'File attachments',
    type: [ChatMessageAttachmentDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageAttachmentDto)
  @IsOptional()
  attachments?: ChatMessageAttachmentDto[];
}
