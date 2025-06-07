import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFormSectionDto {
  @ApiProperty({
    description: 'The name of the section',
    example: 'Personal Information',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The order of the section in the form',
    example: 1,
  })
  @IsNumber()
  order: number;
}
