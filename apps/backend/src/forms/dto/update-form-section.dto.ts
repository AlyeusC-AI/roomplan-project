import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateFormSectionDto {
  @ApiProperty({
    description: 'The name of the section',
    example: 'Personal Information',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The order of the section in the form',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  order?: number;
}
