import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyRecoveryDto {
  @IsString()
  @IsNotEmpty()
  tokenHash: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}
