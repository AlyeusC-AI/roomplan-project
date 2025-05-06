import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({ description: 'User ID to invite' })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Member role',
    enum: ['member', 'admin'],
    required: false,
    default: 'member',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['member', 'admin'])
  role?: string;
}
