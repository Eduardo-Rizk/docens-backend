import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';

export class UpdateTeacherProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  headline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  labels?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2)
  photo?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  institutionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  subjectIds?: string[];
}
