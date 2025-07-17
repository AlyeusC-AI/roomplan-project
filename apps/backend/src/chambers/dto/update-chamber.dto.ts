import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoomChamberDto } from './create-chamber.dto';

export class UpdateChamberDto {
  @ApiPropertyOptional({ description: 'Chamber name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Array of rooms associated with this chamber',
    type: [RoomChamberDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomChamberDto)
  rooms?: RoomChamberDto[];
}
