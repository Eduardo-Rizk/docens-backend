import { IsString, IsNumber, Max, Matches, IsIn } from 'class-validator';

export class UploadProfilePhotoDto {
  @IsString()
  @Matches(/\.(jpg|jpeg|png|webp)$/i, {
    message: 'Extension must be jpg, jpeg, png, or webp',
  })
  filename: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType: string;

  @IsNumber()
  @Max(5 * 1024 * 1024, { message: 'File size must be at most 5MB' })
  sizeBytes: number;
}
