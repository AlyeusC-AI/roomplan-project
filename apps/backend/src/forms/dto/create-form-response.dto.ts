import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FormResponseFieldDto {
  @ApiProperty()
  @IsString()
  fieldId: string;

  @ApiProperty({ required: false })
  @IsString()
  value?: string;
}

export class CreateFormResponseDto {
  @ApiProperty()
  @IsUUID()
  formId: string;

  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiProperty({ type: [FormResponseFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormResponseFieldDto)
  fields: FormResponseFieldDto[];
}
