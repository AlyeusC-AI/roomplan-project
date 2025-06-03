import { IsString, IsNotEmpty } from 'class-validator';

export class SendLidarEmailDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  roomPlanSVG: string;
} 