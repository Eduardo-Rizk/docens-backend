import { IsOptional, IsString, IsEnum } from 'class-validator';
import { InstitutionType } from '@prisma/client';

export class ListInstitutionsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(InstitutionType)
  type?: InstitutionType;
}
