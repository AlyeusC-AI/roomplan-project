import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'newPassword123',
    description: 'The new password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
