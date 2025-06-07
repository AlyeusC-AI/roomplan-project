import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class AssignEquipmentDto {
  @ApiProperty({ description: 'ID of the equipment to assign' })
  @IsString()
  equipmentId: string;

  @ApiProperty({ description: 'ID of the project to assign equipment to' })
  @IsString()
  projectId: string;

  @ApiProperty({ description: 'Quantity of equipment to assign' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'ID of the room to assign equipment to (optional)',
  })
  @IsString()
  @IsOptional()
  roomId?: string;
}
