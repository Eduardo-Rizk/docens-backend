import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // CRITICAL: Use SUPABASE_JWT_SECRET, not SUPABASE_ANON_KEY
      secretOrKey: configService.getOrThrow<string>('SUPABASE_JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: payload.sub },
      include: {
        teacherProfile: { select: { id: true } },
        studentProfile: { select: { id: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'User not found',
      });
    }
    return user;
  }
}
