import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { Role } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ description: 'Email address to invite' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'First name of the invitee', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name of the invitee', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Member role',
    enum: Role,
    required: false,
    default: Role.MEMBER,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
