import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private userCache = new Map<string, { user: any; expiresAt: number }>();
  private static readonly CACHE_TTL = 60_000; // 1 minute
  private static readonly CACHE_MAX = 500;

  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const supabaseUrl = configService.getOrThrow<string>('SUPABASE_URL');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use JWKS endpoint for ES256 token verification
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        cacheMaxAge: 86_400_000, // 24 hours (default: 10 min)
        cacheMaxEntries: 5,
        rateLimit: true,
        jwksRequestsPerMinute: 2, // Keys rarely rotate
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256'],
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const now = Date.now();
    const cached = this.userCache.get(payload.sub);
    if (cached && cached.expiresAt > now) return cached.user;

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

    // Evict oldest entry if cache is full
    if (this.userCache.size >= JwtStrategy.CACHE_MAX) {
      const firstKey = this.userCache.keys().next().value;
      if (firstKey) this.userCache.delete(firstKey);
    }
    this.userCache.set(payload.sub, {
      user,
      expiresAt: now + JwtStrategy.CACHE_TTL,
    });
    return user;
  }
}
