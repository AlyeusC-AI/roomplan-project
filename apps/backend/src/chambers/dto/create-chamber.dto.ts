import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoomChamberDto {
  @ApiProperty({ description: 'Room ID' })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ description: 'Whether the room is affected' })
  @IsBoolean()
  isEffected: boolean;
}

export class CreateChamberDto {
  @ApiProperty({ description: 'Chamber name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Project ID' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({
    description: 'Array of rooms associated with this chamber',
    type: [RoomChamberDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomChamberDto)
  rooms?: RoomChamberDto[];

  @ApiPropertyOptional({ description: 'Category code for water damage' })
  @IsOptional()
  @IsString()
  catCode?: string;

  @ApiPropertyOptional({ description: 'Water class classification' })
  @IsOptional()
  @IsString()
  waterClass?: string;
}
