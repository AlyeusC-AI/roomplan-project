import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ description: 'The content of the note' })
  @IsString()
  //   @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'The ID of the room this note belongs to' })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
