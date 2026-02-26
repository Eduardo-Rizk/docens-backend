import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UploadProfilePhotoDto } from './dto/upload-profile-photo.dto';

@Injectable()
export class UploadsService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async getProfilePhotoUploadUrl(userId: string, dto: UploadProfilePhotoDto) {
    const ext = dto.filename.split('.').pop();
    const storagePath = `profile-photos/${userId}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from('avatars')
      .createSignedUploadUrl(storagePath);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(storagePath);

    return {
      uploadUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      expiresInSec: 600,
    };
  }
}
