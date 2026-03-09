import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
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
