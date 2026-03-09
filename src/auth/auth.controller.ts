import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  private readonly clerkSecretKey: string;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.clerkSecretKey =
      configService.getOrThrow<string>('CLERK_SECRET_KEY');
  }

  @Public()
  @Post('register')
  async register(
    @Headers('authorization') authHeader: string,
    @Body() dto: RegisterDto,
  ) {
    // Verify Clerk JWT manually (user not in DB yet, so normal guard won't work)
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Missing authentication token',
      });
    }
    const token = authHeader.slice(7);
    try {
      const payload = await verifyToken(token, {
        secretKey: this.clerkSecretKey,
      });
      return this.authService.register(payload.sub, dto);
    } catch {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Invalid authentication token',
      });
    }
  }

  @Post('update-password')
  updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user.clerkId, dto.password);
  }

  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }
}
