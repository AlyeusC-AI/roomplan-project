import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({
    description: 'The content of the chat message',
    example: 'Hello team! How is the project going?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
