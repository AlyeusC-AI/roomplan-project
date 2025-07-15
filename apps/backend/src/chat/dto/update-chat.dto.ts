import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty({
    description: 'Name of the group chat',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Array of user IDs to add to the chat',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  addParticipantIds?: string[];

  @ApiProperty({
    description: 'Array of user IDs to remove from the chat',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  removeParticipantIds?: string[];
}
