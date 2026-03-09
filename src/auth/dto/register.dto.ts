import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsEnum,
  IsUUID,
  ArrayMinSize,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Role } from '../decorators/roles.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @IsEnum(Role)
  role: Role;

  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  institutionIds: string[];

  @IsOptional()
  @IsUUID('4', { each: true })
  subjectIds?: string[];

  @IsOptional()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
