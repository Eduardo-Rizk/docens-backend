import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID(4)
  @IsNotEmpty()
  classEventId: string;
}
