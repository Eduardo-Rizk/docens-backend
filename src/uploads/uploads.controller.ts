import { Body, Controller, Post, Request } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadProfilePhotoDto } from './dto/upload-profile-photo.dto';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('profile-photo')
  uploadProfilePhoto(
    @Request() req: any,
    @Body() dto: UploadProfilePhotoDto,
  ) {
    return this.uploadsService.getProfilePhotoUploadUrl(req.user.id, dto);
  }
}
