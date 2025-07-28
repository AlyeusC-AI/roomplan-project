import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty({ description: 'Name of the report' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the report' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the report',
    enum: ReportType,
    default: ReportType.PROJECT_SUMMARY,
  })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiProperty({ description: 'ID of the project this report belongs to' })
  @IsUUID()
  projectId: string;
}
