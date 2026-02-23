import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './decorators/roles.decorator';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async register(dto: RegisterDto) {
    // Validate teacher-specific requirements
    if (
      dto.role === Role.TEACHER &&
      (!dto.subjectIds || dto.subjectIds.length === 0)
    ) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Teachers must provide at least one subjectId',
      });
    }

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } =
      await this.supabase.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        user_metadata: { role: dto.role, name: dto.name },
        email_confirm: true,
      });

    if (authError) {
      throw new ConflictException({
        error: 'CONFLICT',
        message: authError.message,
      });
    }

    // 2. Create DB user + profile in a Prisma transaction
    // If Prisma fails, clean up Supabase Auth user (no ghost users)
    try {
      const txResult = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.create({
          data: {
            supabaseId: authData.user.id,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            role: dto.role,
          },
        });

        if (dto.role === Role.STUDENT) {
          const studentProfile = await tx.studentProfile.create({
            data: {
              userId: user.id,
              labels: dto.labels ?? [],
            },
          });

          // Create student-institution junction rows
          for (const institutionId of dto.institutionIds) {
            await tx.studentInstitution.create({
              data: {
                studentProfileId: studentProfile.id,
                institutionId,
              },
            });
          }

          return {
            user,
            studentProfile,
            teacherProfile: null as null,
          };
        }

        // TEACHER path
        const teacherProfile = await tx.teacherProfile.create({
          data: {
            userId: user.id,
            labels: dto.labels ?? [],
            photoUrl: dto.photoUrl ?? null,
          },
        });

        // Create teacher-institution junction rows
        for (const institutionId of dto.institutionIds) {
          await tx.teacherInstitution.create({
            data: {
              teacherProfileId: teacherProfile.id,
              institutionId,
            },
          });
        }

        // Create teacher-subject junction rows
        for (const subjectId of dto.subjectIds!) {
          await tx.teacherSubject.create({
            data: {
              teacherProfileId: teacherProfile.id,
              subjectId,
            },
          });
        }

        return {
          user,
          studentProfile: null as null,
          teacherProfile,
        };
      });

      // 3. Get session token via sign-in
      const { data: session } =
        await this.supabase.auth.signInWithPassword({
          email: dto.email,
          password: dto.password,
        });

      return {
        ...txResult,
        token: session.session?.access_token,
      };
    } catch (err) {
      // Clean up Supabase Auth user on Prisma failure
      await this.supabase.auth.admin.deleteUser(authData.user.id);
      throw err;
    }
  }

  async login(dto: LoginDto) {
    // 1. Authenticate with Supabase
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    // 2. Fetch user + profile from DB
    const dbUser = await this.prisma.user.findUnique({
      where: { supabaseId: data.user.id },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!dbUser) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'User not found in database',
      });
    }

    return {
      token: data.session.access_token,
      user: dbUser,
      profile: dbUser.studentProfile ?? dbUser.teacherProfile,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            institutions: true,
          },
        },
        teacherProfile: {
          include: {
            institutions: true,
            subjects: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }
}
