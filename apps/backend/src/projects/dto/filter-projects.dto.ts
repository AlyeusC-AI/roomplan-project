import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsArray, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterProjectsDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Start date for filtering projects by creation date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description:
      'End date for filtering projects by creation date (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description:
      'Comma-separated list of assignee user IDs to filter projects by',
    example: 'user-id-1,user-id-2',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    }
    return value;
  })
  assigneeIds?: string[];
}
