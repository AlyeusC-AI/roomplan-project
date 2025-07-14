import { ApiProperty } from '@nestjs/swagger';

export class UpdateCopilotProgressDto {
  @ApiProperty({ type: 'object', required: true })
  copilotProgress: any;
}
