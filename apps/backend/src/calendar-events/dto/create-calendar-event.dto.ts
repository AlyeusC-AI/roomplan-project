import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ReminderTarget } from '@prisma/client';

export class CreateCalendarEventDto {
  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @IsDate()
  start: Date;

  @ApiProperty()
  @IsDate()
  end: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  payload?: any;

  @ApiProperty({ default: false })
  @IsBoolean()
  remindClient: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  remindProjectOwners: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reminderTime?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  users: string[];
}
