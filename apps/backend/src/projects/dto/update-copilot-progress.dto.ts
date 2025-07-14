import { ApiProperty } from '@nestjs/swagger';

export class UpdateCopilotProgressDto {
  @ApiProperty()
  copilotProgress: any;
}
