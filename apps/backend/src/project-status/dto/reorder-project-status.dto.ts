import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class ReorderProjectStatusDto {
  @ApiProperty({
    description: 'Array of project status IDs in their new order',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  statusIds: string[];
}
