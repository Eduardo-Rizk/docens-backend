import {
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  Length,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateStudentProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @IsOptional()
  @IsUUID('4')
  preferredInstitutionId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  institutionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  labels?: string[];
}
