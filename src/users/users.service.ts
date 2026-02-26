import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        teacherProfile: {
          select: {
            id: true,
            bio: true,
            photoUrl: true,
            headline: true,
            institutions: {
              select: {
                institution: { select: { id: true, shortName: true } },
              },
            },
            subjects: {
              select: { subject: { select: { id: true, name: true } } },
            },
            _count: { select: { classEvents: true } },
          },
        },
        studentProfile: {
          select: {
            id: true,
            preferredInstitution: {
              select: { id: true, shortName: true },
            },
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

    // Build response based on role — no email exposed
    if (user.role === 'TEACHER' && user.teacherProfile) {
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        teacherProfile: {
          bio: user.teacherProfile.bio,
          photoUrl: user.teacherProfile.photoUrl,
          headline: user.teacherProfile.headline,
          institutions: user.teacherProfile.institutions.map(
            (ti) => ti.institution,
          ),
          subjects: user.teacherProfile.subjects.map((ts) => ts.subject),
          totalClasses: user.teacherProfile._count.classEvents,
        },
      };
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      preferredInstitution:
        user.studentProfile?.preferredInstitution ?? null,
    };
  }
}
