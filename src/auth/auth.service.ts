import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from './decorators/roles.decorator';

@Injectable()
export class AuthService {
  private readonly clerk: ReturnType<typeof createClerkClient>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.configService.getOrThrow<string>('CLERK_SECRET_KEY'),
    });
  }

  async register(clerkId: string, dto: RegisterDto) {
    if (
      dto.role === Role.TEACHER &&
      (!dto.subjectIds || dto.subjectIds.length === 0)
    ) {
      throw new BadRequestException({
        error: 'VALIDATION_ERROR',
        message: 'Teachers must provide at least one subjectId',
      });
    }

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { clerkId },
    });
    if (existing) {
      throw new ConflictException({
        error: 'CONFLICT',
        message: 'User already registered',
      });
    }

    // Set role metadata on Clerk user
    try {
      await this.clerk.users.updateUser(clerkId, {
        publicMetadata: { role: dto.role },
      });
    } catch {
      // Non-critical — continue with DB creation
    }

    // Create DB user + profile in a Prisma transaction
    const txResult = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.create({
          data: {
            clerkId,
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

          if (dto.institutionIds.length > 0) {
            await tx.studentInstitution.createMany({
              data: dto.institutionIds.map((institutionId) => ({
                studentProfileId: studentProfile.id,
                institutionId,
              })),
            });
          }

          return {
            user,
            studentProfile,
            teacherProfile: null,
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

        if (dto.institutionIds.length > 0) {
          await tx.teacherInstitution.createMany({
            data: dto.institutionIds.map((institutionId) => ({
              teacherProfileId: teacherProfile.id,
              institutionId,
            })),
          });
        }

        if (dto.subjectIds!.length > 0) {
          await tx.teacherSubject.createMany({
            data: dto.subjectIds!.map((subjectId) => ({
              teacherProfileId: teacherProfile.id,
              subjectId,
            })),
          });
        }

        return {
          user,
          studentProfile: null,
          teacherProfile,
        };
      },
    );

    return {
      message: 'Account created successfully.',
      user: txResult.user,
    };
  }

  async updatePassword(clerkId: string, newPassword: string) {
    try {
      await this.clerk.users.updateUser(clerkId, { password: newPassword });
    } catch (err: any) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: err?.errors?.[0]?.message ?? 'Failed to update password',
      });
    }

    return { message: 'Password updated successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            institutions: { select: { institutionId: true } },
          },
        },
        teacherProfile: {
          include: {
            institutions: { select: { institutionId: true } },
            subjects: { select: { subjectId: true } },
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
