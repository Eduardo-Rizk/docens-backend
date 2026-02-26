import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmPaymentDto {
  @IsUUID(4)
  @IsNotEmpty()
  enrollmentId: string;
}
