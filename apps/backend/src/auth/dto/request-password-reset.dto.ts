import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user requesting password reset',
  })
  @IsEmail()
  email: string;
}
