import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum ChatType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
  PROJECT = 'PROJECT',
}

export class CreateChatDto {
  @ApiProperty({
    description: 'Type of chat',
    enum: ChatType,
  })
  @IsEnum(ChatType)
  type: ChatType;

  @ApiProperty({
    description: 'Name of the group chat (required for GROUP type)',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Project ID (required for PROJECT type)',
    required: false,
  })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({
    description: 'Array of user IDs to add to the chat',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  participantIds: string[];
}
