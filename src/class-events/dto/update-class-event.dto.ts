import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsUrl,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export enum ClassEventAction {
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  FINISH = 'finish',
  RELEASE_MEETING = 'release-meeting',
  LOCK_MEETING = 'lock-meeting',
}

export class UpdateClassEventDto {
  @IsOptional()
  @IsEnum(ClassEventAction)
  action?: ClassEventAction;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUrl()
  meetingUrl?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(300)
  durationMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  capacity?: number | null;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  subjectId?: string;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  institutionId?: string;
}
