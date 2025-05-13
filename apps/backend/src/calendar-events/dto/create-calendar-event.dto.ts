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
  @IsString()
  start: Date;

  @ApiProperty()
  @IsString()
  end: Date;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  remindClient?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  remindProjectOwners?: boolean;

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
  @IsOptional()
  users?: string[];
}
