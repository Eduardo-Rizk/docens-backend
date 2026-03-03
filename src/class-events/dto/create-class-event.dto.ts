import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export class CreateClassEventDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @IsString()
  @IsUUID('4')
  subjectId: string;

  @IsString()
  @IsUUID('4')
  institutionId: string;

  @IsDateString()
  startsAt: string;

  @IsInt()
  @Min(30)
  @Max(300)
  durationMin: number;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  capacity?: number | null;

  @IsOptional()
  @IsUrl()
  meetingUrl?: string;
}
