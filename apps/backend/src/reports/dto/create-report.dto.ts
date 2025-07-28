import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: 'Name of the report' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the report' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID of the project this report belongs to' })
  @IsUUID()
  projectId: string;
}
